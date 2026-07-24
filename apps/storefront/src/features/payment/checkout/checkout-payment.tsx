"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";

import {
  type AppErrorCode,
  type BaseError,
} from "@nimara/domain/objects/Error";
import { type Maybe } from "@nimara/domain/objects/Maybe";
import { type PaymentMethod } from "@nimara/domain/objects/Payment";
import { useRouter } from "@nimara/i18n/routing";
import type { TransactionData } from "@nimara/infrastructure/payment/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nimara/ui/components/tabs";
import { cn } from "@nimara/ui/lib/utils";

import { PaymentMethods } from "@/features/checkout/payment-methods";
import { usePaymentData } from "@/features/payment/hooks/use-payment-data";

import { BillingAddressSection } from "./components/billing-address-section";
import { NewPaymentMethodSection } from "./components/new-payment-method-section";
import { PlaceOrderButton } from "./components/place-order-button";
import { usePaymentForm } from "./hooks/use-payment-form";
import { usePaymentSubmit } from "./hooks/use-payment-submit";
import { type PaymentSchema } from "./schema";
import { type TabName } from "./tabs/address-tab";
import { type CommonPaymentProps } from "./types";

type CheckoutPaymentProps = CommonPaymentProps & {
  initialTransactionData?: Maybe<TransactionData>;
  paymentGatewayCustomer: Maybe<string>;
  paymentGatewayMethods: PaymentMethod[];
};

/**
 * The standard checkout payment: a Saleor transaction backs the payment,
 * with saved payment methods offered next to the new-method element.
 */
export const CheckoutPayment = ({
  addressFormRows,
  checkout,
  countries,
  countryCode,
  errorCode,
  formattedAddresses,
  initialTransactionData,
  paymentGatewayCustomer,
  paymentGatewayMethods,
  storeUrl,
  user,
}: CheckoutPaymentProps) => {
  const t = useTranslations();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [errors, setErrors] = useState<AppErrorCode[]>(
    errorCode ? [errorCode] : [],
  );
  const hasSavedPaymentMethods = paymentGatewayMethods.length > 0;
  const [paymentMethodTab, setPaymentMethodTab] = useState<TabName>(
    hasSavedPaymentMethods ? "saved" : "new",
  );
  const {
    initializeData,
    initializeTransaction,
    setTransactionData,
    transactionData,
  } = usePaymentData({
    initialTransactionData,
    onErrors: setErrors,
  });
  const elementsRef = useRef<unknown>(null);
  const initialTransactionRef = useRef(!!initialTransactionData);

  const defaultPaymentMethod =
    paymentGatewayMethods.find(({ isDefault }) => isDefault)?.id ??
    paymentGatewayMethods[0]?.id;

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

  const hasSelectedPaymentMethod = !!paymentMethod;
  const isAddingNewPaymentMethod = paymentMethodTab === "new";
  const isInitialized = !!initializeData;
  const isLoading = !isInitialized || isProcessing;
  const canProceed =
    !isLoading &&
    (isAddingNewPaymentMethod ? isMounted : hasSelectedPaymentMethod);

  /**
   * Using an existing payment method requires passing it to the stripe app
   * to tokenize it and obtain a fresh intent secret, which the payment is
   * then confirmed against. The intent is confirmed directly — it is not
   * stored, so the mounted payment element keeps its transaction.
   */
  const resolveTransactionData = async ({
    paymentMethod,
    saveForFutureUse,
  }: PaymentSchema) => {
    if (!isAddingNewPaymentMethod && paymentMethod) {
      const data = await initializeTransaction({
        id: checkout.id,
        amount: checkout.totalPrice.gross.amount,
        paymentMethod,
        customerId: paymentGatewayCustomer,
        saveForFutureUse,
      });

      if (!data) {
        router.refresh();

        return undefined;
      }

      return data;
    }

    return transactionData;
  };

  /**
   * A failed confirmation may leave the intent unusable, so remount the
   * payment element against a fresh one. Validation errors are exempt —
   * the shopper fixes the input in place and retries the same intent.
   */
  const handleExecuteFailure = async (
    executeErrors: BaseError[],
    { saveForFutureUse }: PaymentSchema,
  ) => {
    if (
      isAddingNewPaymentMethod &&
      !executeErrors.some(({ code }) => code === "PAYMENT_VALIDATION_ERROR")
    ) {
      setIsMounted(false);
      setTransactionData(undefined);

      const data = await initializeTransaction({
        id: checkout.id,
        amount: checkout.totalPrice.gross.amount,
        customerId: paymentGatewayCustomer,
        saveForFutureUse,
      });

      if (data) {
        setTransactionData(data);
      }

      return;
    }

    router.refresh();
  };

  const handlePlaceOrder = usePaymentSubmit({
    checkout,
    elementsRef,
    form,
    initializeData,
    isAddingNewPaymentMethod,
    isProcessing,
    onExecuteFailure: handleExecuteFailure,
    resolveTransactionData,
    setErrors,
    setIsProcessing,
    storeUrl,
  });

  useEffect(() => {
    if (isAddingNewPaymentMethod) {
      form.setValue("paymentMethod", undefined);

      return;
    }

    /**
     * The payment element writes the picked method type into `paymentMethod`,
     * so restore the saved-method selection when switching back to the tab.
     */
    form.setValue("paymentMethod", defaultPaymentMethod);
    setIsMounted(false);
  }, [form, isAddingNewPaymentMethod, defaultPaymentMethod]);

  /**
   * Using a new payment method requires a new intent secret which the
   * payment element is then created against.
   */
  useEffect(() => {
    if (!isInitialized || !isAddingNewPaymentMethod) {
      return;
    }

    let isCancelled = false;

    void (async () => {
      /**
       * The first activation consumes the intent pre-initialized on the
       * server — no client fetch needed.
       */
      if (initialTransactionRef.current) {
        initialTransactionRef.current = false;

        return;
      }

      setIsMounted(false);
      setTransactionData(undefined);

      const data = await initializeTransaction({
        id: checkout.id,
        amount: checkout.totalPrice.gross.amount,
        customerId: paymentGatewayCustomer,
        saveForFutureUse,
      });

      if (isCancelled || !data) {
        return;
      }

      setTransactionData(data);
    })();

    return () => {
      isCancelled = true;
    };
  }, [
    checkout.id,
    checkout.totalPrice.gross.amount,
    isInitialized,
    isAddingNewPaymentMethod,
    paymentGatewayCustomer,
    saveForFutureUse,
  ]);

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
                showSaveForFutureUse={!!user}
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
