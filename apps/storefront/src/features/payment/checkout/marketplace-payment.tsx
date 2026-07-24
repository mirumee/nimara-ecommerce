"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";

import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { useRouter } from "@nimara/i18n/routing";

import { type MarketplaceCheckoutItem } from "@/features/checkout/types";
import { initializeMarketplacePaymentIntent } from "@/features/payment/checkout/actions";
import { usePaymentData } from "@/features/payment/hooks/use-payment-data";

import { BillingAddressSection } from "./components/billing-address-section";
import { NewPaymentMethodSection } from "./components/new-payment-method-section";
import { PlaceOrderButton } from "./components/place-order-button";
import { usePaymentForm } from "./hooks/use-payment-form";
import { usePaymentSubmit } from "./hooks/use-payment-submit";
import { type CommonPaymentProps } from "./types";

type MarketplacePaymentProps = CommonPaymentProps & {
  marketplaceCheckouts: MarketplaceCheckoutItem[];
};

type MarketplaceIntentCheckout = {
  amount: number;
  checkoutId: string;
  currency: string;
};

const buildMarketplaceIntentKey = ({
  buyerId,
  checkouts,
}: {
  buyerId?: string;
  checkouts: MarketplaceIntentCheckout[];
}) =>
  JSON.stringify({
    buyerId: buyerId ?? null,
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
  storeUrl,
  user,
}: MarketplacePaymentProps) => {
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [errors, setErrors] = useState<AppErrorCode[]>(
    errorCode ? [errorCode] : [],
  );
  const { initializeData, setTransactionData, transactionData } =
    usePaymentData({
      onErrors: setErrors,
    });
  const elementsRef = useRef<unknown>(null);
  const intentInFlightRef = useRef<string | null>(null);
  const intentInitializedRef = useRef<string | null>(null);

  const {
    addressActiveTab,
    form,
    isCountryChanging,
    sameAsShippingAddress,
    setAddressActiveTab,
    setIsCountryChanging,
  } = usePaymentForm({
    addressFormRows,
    checkout,
    countries,
    countryCode,
    errorCode,
    formattedAddresses,
    user,
  });

  const isInitialized = !!initializeData;
  const isLoading = !isInitialized || isProcessing;
  const canProceed = !isLoading && isMounted;

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
          }),
    [intentCheckouts, user?.id],
  );

  const handlePlaceOrder = usePaymentSubmit({
    checkout,
    elementsRef,
    form,
    initializeData,
    isAddingNewPaymentMethod: true,
    isProcessing,
    onExecuteFailure: () => router.refresh(),
    resolveTransactionData: async () => transactionData,
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
    if (!isInitialized) {
      return;
    }

    void (async () => {
      if (!intentKey) {
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

      const result = await initializeMarketplacePaymentIntent({
        buyerId: user?.id,
        checkouts: intentCheckouts,
      });

      if (intentInFlightRef.current === intentKey) {
        intentInFlightRef.current = null;
      }

      if (!result.ok) {
        setErrors(result.errors.map(({ code }) => code));

        return;
      }

      intentInitializedRef.current = intentKey;
      setTransactionData({ clientSecret: result.data.clientSecret });
    })();
  }, [intentCheckouts, intentKey, isInitialized, user?.id]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handlePlaceOrder)} noValidate>
        <div className="mb-8 space-y-6">
          <NewPaymentMethodSection
            checkout={checkout}
            initializeData={initializeData}
            isMounted={isMounted}
            isProcessing={isProcessing}
            onReady={() => setIsMounted(true)}
            ref={elementsRef}
            showSaveForFutureUse={false}
            transactionData={transactionData}
          />

          <BillingAddressSection
            activeTab={addressActiveTab}
            addressFormRows={addressFormRows}
            countries={countries}
            countryCode={countryCode}
            formattedAddresses={formattedAddresses}
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
