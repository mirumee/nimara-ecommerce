"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";

import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { type PaymentMethod } from "@nimara/domain/objects/Payment";
import { useRouter } from "@nimara/i18n/routing";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nimara/ui/components/tabs";
import { cn } from "@nimara/ui/lib/utils";

import { clientEnvs } from "@/envs/client";
import { PaymentMethods } from "@/features/checkout/payment-methods";
import { type MarketplaceCheckoutItem } from "@/features/checkout/types";
import { initializeMarketplacePayment } from "@/features/payment/checkout/actions";
import { usePaymentData } from "@/features/payment/hooks/use-payment-data";

import { BillingAddressSection } from "./components/billing-address-section";
import { NewPaymentMethodSection } from "./components/new-payment-method-section";
import { PlaceOrderButton } from "./components/place-order-button";
import { usePaymentForm } from "./hooks/use-payment-form";
import { usePaymentSubmit } from "./hooks/use-payment-submit";
import { type PaymentSchema } from "./schema";
import { type TabName } from "./tabs/address-tab";
import { type CommonPaymentProps } from "./types";

type MarketplacePaymentProps = CommonPaymentProps & {
  marketplaceCheckouts: MarketplaceCheckoutItem[];
  paymentGatewayMethods: PaymentMethod[];
};

type MarketplaceIntentCheckout = {
  amount: number;
  checkoutId: string;
  currency: string;
};

const buildMarketplaceIntentKey = ({
  buyerId,
  checkouts,
  saveForFutureUse,
}: {
  buyerId?: string;
  checkouts: MarketplaceIntentCheckout[];
  saveForFutureUse: boolean;
}) =>
  JSON.stringify({
    buyerId: buyerId ?? null,
    saveForFutureUse,
    checkouts: [...checkouts]
      .sort((a, b) => a.checkoutId.localeCompare(b.checkoutId))
      .map((checkout) => ({
        amount: checkout.amount,
        checkoutId: checkout.checkoutId,
        currency: checkout.currency.toUpperCase(),
      })),
  });

/**
 * The marketplace payment: a marketplace payment intent (from the vendor
 * API) backs the payment — no Saleor transaction and no saved methods, the
 * payment element is the only method.
 */
export const MarketplacePayment = ({
  addressFormRows,
  checkout,
  countries,
  countryCode,
  errorCode,
  formattedAddresses,
  marketplaceCheckouts,
  paymentGatewayMethods,
  storeUrl,
  user,
}: MarketplacePaymentProps) => {
  const t = useTranslations();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [errors, setErrors] = useState<AppErrorCode[]>(
    errorCode ? [errorCode] : [],
  );
  const hasPaymentApp = !!clientEnvs.PAYMENT_APP_ID;
  const hasSavedPaymentMethods =
    hasPaymentApp && paymentGatewayMethods.length > 0;
  const [paymentMethodTab, setPaymentMethodTab] = useState<TabName>(
    hasSavedPaymentMethods ? "saved" : "new",
  );
  const canSaveForFutureUse = !!user && hasPaymentApp;
  const {
    initializeData,
    initializeGateway,
    setTransactionData,
    transactionData,
  } = usePaymentData({
    onErrors: setErrors,
  });
  const elementsRef = useRef<unknown>(null);
  const intentInFlightRef = useRef<string | null>(null);
  const intentInitializedRef = useRef<string | null>(null);
  const latestIntentKeyRef = useRef<string | null>(null);

  const defaultPaymentMethod =
    paymentGatewayMethods.find(({ isDefault }) => isDefault)?.token ??
    paymentGatewayMethods[0]?.token;

  const {
    addressActiveTab,
    form,
    isCountryChanging,
    paymentMethod,
    sameAsShippingAddress,
    saveForFutureUse,
    setAddressActiveTab,
    setIsCountryChanging,
  } = usePaymentForm({
    addressFormRows,
    checkout,
    countries,
    countryCode,
    defaultPaymentMethod,
    errorCode,
    formattedAddresses,
    user,
  });

  const shouldSaveForFutureUse = canSaveForFutureUse && !!saveForFutureUse;
  const isAddingNewPaymentMethod = paymentMethodTab === "new";
  const isReady = isAddingNewPaymentMethod ? !!initializeData : true;
  const isLoading = !isReady || isProcessing;
  const canProceed =
    !isLoading && (isAddingNewPaymentMethod ? isMounted : !!paymentMethod);

  const intentCheckouts = useMemo<MarketplaceIntentCheckout[]>(
    () =>
      marketplaceCheckouts.map((item) => ({
        amount: item.checkout.totalPrice.gross.amount,
        checkoutId: item.checkoutId,
        currency: item.checkout.totalPrice.gross.currency,
      })),
    [marketplaceCheckouts],
  );
  const intentKey = useMemo(
    () =>
      intentCheckouts.length === 0
        ? null
        : buildMarketplaceIntentKey({
            buyerId: user?.id,
            checkouts: intentCheckouts,
            saveForFutureUse: shouldSaveForFutureUse,
          }),
    [intentCheckouts, shouldSaveForFutureUse, user?.id],
  );

  const resolveTransactionData = async ({ paymentMethod }: PaymentSchema) => {
    if (isAddingNewPaymentMethod || !paymentMethod) {
      return transactionData;
    }

    const result = await initializeMarketplacePayment({
      buyerId: user?.id,
      checkouts: intentCheckouts,
      paymentMethodId: paymentMethod,
      saveForFutureUse: false,
    });

    if (!result.ok) {
      setErrors(result.errors.map(({ code }) => code));
      router.refresh();

      return undefined;
    }

    return {
      gatewayConfig: { publishableKey: result.data.publishableKey },
      providerData: { clientSecret: result.data.clientSecret },
      sessionId: `${intentKey}:${paymentMethod}`,
    };
  };

  const handlePlaceOrder = usePaymentSubmit({
    checkout,
    elementsRef,
    form,
    initializeGateway,
    isAddingNewPaymentMethod,
    isProcessing,
    onExecuteFailure: () => router.refresh(),
    resolveTransactionData,
    setErrors,
    setIsProcessing,
    storeUrl,
  });

  /**
   * The payment element requires an intent secret to mount against — created
   * through the marketplace vendor API, deduplicated by the intent key so a
   * re-render never spawns a second intent for the same checkouts.
   */
  useEffect(() => {
    latestIntentKeyRef.current = intentKey;

    void (async () => {
      if (!intentKey || !isAddingNewPaymentMethod) {
        return;
      }

      if (intentInitializedRef.current === intentKey) {
        return;
      }

      if (intentInFlightRef.current === intentKey) {
        return;
      }

      intentInFlightRef.current = intentKey;
      setIsMounted(false);
      setTransactionData(undefined);

      const result = await initializeMarketplacePayment({
        buyerId: user?.id,
        checkouts: intentCheckouts,
        saveForFutureUse: shouldSaveForFutureUse,
      });

      if (intentInFlightRef.current === intentKey) {
        intentInFlightRef.current = null;
      }

      if (latestIntentKeyRef.current !== intentKey) {
        return;
      }

      if (!result.ok) {
        setErrors(result.errors.map(({ code }) => code));

        return;
      }

      const gatewayConfig = { publishableKey: result.data.publishableKey };

      if (
        !(await initializeGateway(gatewayConfig)) ||
        latestIntentKeyRef.current !== intentKey
      ) {
        return;
      }

      intentInitializedRef.current = intentKey;
      setTransactionData({
        gatewayConfig,
        providerData: { clientSecret: result.data.clientSecret },
        /**
         * Marketplace intents are not Saleor transactions, so the key the
         * intent was requested under identifies the session.
         */
        sessionId: intentKey,
      });
    })();
  }, [
    intentCheckouts,
    intentKey,
    isAddingNewPaymentMethod,
    shouldSaveForFutureUse,
    user?.id,
  ]);

  useEffect(() => {
    if (isAddingNewPaymentMethod) {
      form.setValue("paymentMethod", undefined);

      return;
    }

    form.setValue("paymentMethod", defaultPaymentMethod);
    setIsMounted(false);
  }, [form, isAddingNewPaymentMethod, defaultPaymentMethod]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handlePlaceOrder)} noValidate>
        <div className="mb-8 space-y-6">
          <Tabs
            defaultValue={paymentMethodTab}
            onValueChange={(value) => setPaymentMethodTab(value as TabName)}
            className="grid gap-5"
          >
            <TabsList
              className={cn("grid w-full grid-cols-2", {
                hidden: !hasSavedPaymentMethods,
              })}
            >
              <TabsTrigger disabled={isLoading} value="saved">
                {t("payment.saved-methods")}
              </TabsTrigger>
              <TabsTrigger disabled={isLoading} value="new">
                {t("payment.new-method")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved">
              <PaymentMethods methods={paymentGatewayMethods} />
            </TabsContent>

            <TabsContent value="new">
              <NewPaymentMethodSection
                checkout={checkout}
                initializeData={initializeData}
                isMounted={isMounted}
                isProcessing={isProcessing}
                onReady={() => setIsMounted(true)}
                ref={elementsRef}
                showSaveForFutureUse={canSaveForFutureUse}
                transactionData={transactionData}
              />
            </TabsContent>
          </Tabs>

          <BillingAddressSection
            activeTab={addressActiveTab}
            addressFormRows={addressFormRows}
            countries={countries}
            countryCode={countryCode}
            formattedAddresses={formattedAddresses}
            hasShippingAddress={!!checkout.shippingAddress}
            isProcessing={isProcessing}
            isShippingRequired={checkout.isShippingRequired}
            onCountryChange={setIsProcessing}
            sameAsShippingAddress={sameAsShippingAddress}
            setActiveTab={setAddressActiveTab}
            setIsCountryChanging={setIsCountryChanging}
            user={user}
          />

          <PlaceOrderButton
            errors={errors}
            isDisabled={isCountryChanging || !canProceed}
            isLoading={isLoading}
          />
        </div>
      </form>
    </FormProvider>
  );
};
