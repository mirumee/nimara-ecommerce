"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";

import { type AllCountryCode } from "@nimara/domain/consts";
import {
  type Address,
  type CountryOption,
} from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { type Maybe } from "@nimara/domain/objects/Maybe";
import { type PaymentMethod } from "@nimara/domain/objects/Payment";
import { type User } from "@nimara/domain/objects/User";
import {
  addressToSchema,
  schemaToAddress,
} from "@nimara/foundation/address/address";
import { AddressForm } from "@nimara/foundation/address/address-form/address-form";
import type { FormattedAddress } from "@nimara/foundation/address/types";
import { CheckboxField } from "@nimara/foundation/form-components/checkbox-field";
import { usePathname, useRouter } from "@nimara/i18n/routing";
import { ADDRESS_DEFAULT_VALUES } from "@nimara/infrastructure/consts";
import type {
  StripeElements,
  TransactionData,
} from "@nimara/infrastructure/payment/types";
import { Button } from "@nimara/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nimara/ui/components/tabs";
import { useToast } from "@nimara/ui/hooks";
import { cn } from "@nimara/ui/lib/utils";

import { clientEnvs } from "@/envs/client";
import { PaymentMethods } from "@/features/checkout/payment-methods";
import { type MarketplaceCheckoutItem } from "@/features/checkout/types";
import {
  initializeMarketplacePaymentIntent,
  updateBillingAddress,
} from "@/features/payment/checkout/actions";
import {
  type BillingAddressPath,
  type BillingAddressValue,
  type PaymentSchema,
  paymentSchema,
} from "@/features/payment/checkout/schema";
import { PaymentElement } from "@/features/payment/components/payment-element";
import { usePaymentData } from "@/features/payment/hooks/use-payment-data";
import { isGlobalError } from "@/foundation/errors/errors";
import { useCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { createPaymentServiceLoader } from "@/services/lazy-loaders/payment";
import { createTrackingServiceLoader } from "@/services/lazy-loaders/tracking";
import { storefrontLogger } from "@/services/logging";

import { AddressTab } from "./tabs/address-tab";

export type TabName = "new" | "saved";

const paymentServiceLoader = createPaymentServiceLoader(storefrontLogger);
const trackingServiceLoader = createTrackingServiceLoader();

type PaymentProps = {
  addressFormRows: readonly AddressFormRow[];
  checkout: Checkout;
  countries: CountryOption[];
  countryCode: AllCountryCode;
  errorCode?: AppErrorCode;
  formattedAddresses: FormattedAddress[];
  initialTransactionData?: Maybe<TransactionData>;
  marketplaceCheckouts?: MarketplaceCheckoutItem[];
  paymentGatewayCustomer: Maybe<string>;
  paymentGatewayMethods: PaymentMethod[];
  storeUrl: string;
  user: User | null;
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

export const Payment = ({
  checkout,
  errorCode,
  storeUrl,
  addressFormRows,
  countries,
  countryCode,
  initialTransactionData,
  paymentGatewayMethods,
  paymentGatewayCustomer,
  formattedAddresses,
  marketplaceCheckouts,
  user,
}: PaymentProps) => {
  const t = useTranslations();

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const region = useCurrentRegion();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isCountryChanging, setIsCountryChanging] = useState(false);
  const isMarketplacePayment =
    clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED &&
    !!marketplaceCheckouts &&
    marketplaceCheckouts.length > 0;
  const hasSavedPaymentMethods =
    !isMarketplacePayment && paymentGatewayMethods.length > 0;
  const [paymentMethodTab, setPaymentMethodTab] = useState<TabName>(
    hasSavedPaymentMethods ? "saved" : "new",
  );
  const [addressActiveTab, setAddressActiveTab] = useState<TabName>(
    formattedAddresses.length ? "saved" : "new",
  );
  const [errors, setErrors] = useState<AppErrorCode[]>(
    errorCode ? [errorCode] : [],
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
  const elementsRef = useRef<StripeElements | null>(null);
  const initialTransactionRef = useRef(!!initialTransactionData);
  const marketplaceIntentInFlightRef = useRef<string | null>(null);
  const marketplaceIntentInitializedRef = useRef<string | null>(null);

  const defaultBillingAddress = formattedAddresses.find(
    ({ address }) => address.isDefaultBillingAddress,
  )?.address;
  const formattedToSchemaDefaultBillingAddress = {
    ...ADDRESS_DEFAULT_VALUES,
    ...addressToSchema(
      defaultBillingAddress ?? (ADDRESS_DEFAULT_VALUES as Address),
    ),
    id: defaultBillingAddress?.id,
  };
  const defaultEmptyBillingAddress = {
    ...ADDRESS_DEFAULT_VALUES,
    country: countryCode,
  } as PaymentSchema["billingAddress"];
  const hasDefaultBillingAddress =
    formattedAddresses[0]?.address.isDefaultBillingAddress;
  const supportedCountryCodesInChannel = countries?.map(({ value }) => value);
  const hasDefaultBillingAddressInCurrentChannel =
    supportedCountryCodesInChannel.includes(defaultBillingAddress?.country);
  const saveAddressForFutureUse = !!(user && addressActiveTab === "new");
  const marketplaceIntentCheckouts = useMemo<
    MarketplaceIntentCheckout[]
  >(() => {
    if (!isMarketplacePayment) {
      return [];
    }

    return (
      marketplaceCheckouts?.map((item) => ({
        checkoutId: item.checkoutId,
        amount: item.checkout.totalPrice.gross.amount,
        currency: item.checkout.totalPrice.gross.currency,
      })) ?? [
        {
          checkoutId: checkout.id,
          amount: checkout.totalPrice.gross.amount,
          currency: checkout.totalPrice.gross.currency,
        },
      ]
    );
  }, [
    checkout.id,
    checkout.totalPrice.gross.amount,
    checkout.totalPrice.gross.currency,
    isMarketplacePayment,
    marketplaceCheckouts,
  ]);
  const marketplaceIntentKey = useMemo(() => {
    if (!isMarketplacePayment || marketplaceIntentCheckouts.length === 0) {
      return null;
    }

    return buildMarketplaceIntentKey({
      buyerId: user?.id,
      checkouts: marketplaceIntentCheckouts,
    });
  }, [isMarketplacePayment, marketplaceIntentCheckouts, user?.id]);

  const form = useForm<PaymentSchema>({
    resolver: zodResolver(paymentSchema({ t, addressFormRows })),
    defaultValues: {
      billingAddress: hasDefaultBillingAddress
        ? formattedToSchemaDefaultBillingAddress
        : defaultEmptyBillingAddress,
      sameAsShippingAddress: checkout.isShippingRequired
        ? !hasDefaultBillingAddressInCurrentChannel
        : false,
      saveAddressForFutureUse,
      saveForFutureUse: !!user,
      paymentMethod: isMarketplacePayment
        ? undefined
        : (paymentGatewayMethods.find(({ isDefault }) => isDefault)?.id ??
          paymentGatewayMethods?.[0]?.id),
    },
  });

  const billingAddressCountry = form.getValues("billingAddress.country");

  const [saveForFutureUse, sameAsShippingAddress, paymentMethod] = form.watch([
    "saveForFutureUse",
    "sameAsShippingAddress",
    "paymentMethod",
  ]);
  const hasSelectedPaymentMethod = !!paymentMethod;
  const isAddingNewPaymentMethod = paymentMethodTab === "new";
  const isInitialized = !!initializeData;
  const isLoading = !isInitialized || isProcessing;
  const canProceed =
    !isLoading &&
    (isMarketplacePayment
      ? isMounted
      : isAddingNewPaymentMethod
        ? isMounted
        : hasSelectedPaymentMethod);

  const fullNameSource = checkout.billingAddress ?? checkout.shippingAddress;
  const fullName = fullNameSource
    ? [fullNameSource.firstName, fullNameSource.lastName]
        .filter(Boolean)
        .join(" ") || undefined
    : undefined;

  const handlePlaceOrder: SubmitHandler<PaymentSchema> = async ({
    paymentMethod,
    sameAsShippingAddress,
    saveAddressForFutureUse,
    saveForFutureUse,
    billingAddress,
  }) => {
    if (isProcessing) {
      return false;
    }

    setErrors([]);
    setIsProcessing(true);

    delete billingAddress?.id;

    {
      const result = await updateBillingAddress({
        checkout,
        input: {
          sameAsShippingAddress,
          saveAddressForFutureUse,
          billingAddress,
        },
        revalidateCheckout: false,
      });

      if (!result.ok) {
        result.errors.map(({ field, code }) => {
          if (isGlobalError(field)) {
            toast({ variant: "destructive", description: t(`errors.${code}`) });
          } else {
            form.setError(`billingAddress.${field}` as BillingAddressPath, {
              message: t(`errors.${code}`),
            });
          }
        });

        setIsProcessing(false);

        return;
      }
    }

    const { trackAddPaymentInfo } = await trackingServiceLoader();

    await trackAddPaymentInfo({
      checkout,
      paymentType: isAddingNewPaymentMethod ? paymentMethod : "saved",
    });

    const redirectUrl = `${storeUrl}${paths.payment.confirmation.asPath()}`;
    const paymentService = await paymentServiceLoader();

    if (!initializeData) {
      setIsProcessing(false);

      return;
    }

    let activeTransactionData = transactionData;

    /**
     * Using an existing payment method requires passing it to the stripe app
     * to tokenize it and obtain a fresh intent secret, which the payment is
     * then confirmed against. The intent is confirmed directly — it is not
     * stored, so the mounted payment element keeps its transaction.
     */
    if (!isMarketplacePayment && !isAddingNewPaymentMethod && paymentMethod) {
      const data = await initializeTransaction({
        id: checkout.id,
        amount: checkout.totalPrice.gross.amount,
        paymentMethod,
        customerId: paymentGatewayCustomer,
        saveForFutureUse,
      });

      if (!data) {
        setIsProcessing(false);
        router.refresh();

        return;
      }

      activeTransactionData = data;
    }

    if (!activeTransactionData) {
      setIsProcessing(false);

      return;
    }

    const billingSource = sameAsShippingAddress
      ? checkout.shippingAddress
      : billingAddress
        ? schemaToAddress(billingAddress)
        : checkout.billingAddress;

    const result = await paymentService.execute({
      data: {
        billingDetails: billingSource
          ? {
              city: billingSource.city ?? "",
              country: (billingSource.country ?? "") as AllCountryCode,
              countryArea: billingSource.countryArea ?? "",
              firstName: billingSource.firstName ?? "",
              lastName: billingSource.lastName ?? "",
              postalCode: billingSource.postalCode ?? "",
              streetAddress1: billingSource.streetAddress1 ?? "",
              streetAddress2: billingSource.streetAddress2 ?? "",
            }
          : undefined,
        elements:
          isMarketplacePayment || isAddingNewPaymentMethod
            ? (elementsRef.current ?? undefined)
            : undefined,
        email: checkout.email!,
        redirectUrl,
      },
      initializeData,
      transactionData: activeTransactionData,
    });

    if (!result.ok) {
      setErrors(result.errors.map(({ code }) => code));
      setIsProcessing(false);

      /**
       * A failed confirmation may leave the intent unusable, so remount the
       * payment element against a fresh one. Validation errors are exempt —
       * the shopper fixes the input in place and retries the same intent.
       */
      if (
        !isMarketplacePayment &&
        isAddingNewPaymentMethod &&
        !result.errors.some(({ code }) => code === "PAYMENT_VALIDATION_ERROR")
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
    }
  };

  useEffect(() => {
    if (isAddingNewPaymentMethod) {
      form.setValue("paymentMethod", undefined);

      return;
    }

    /**
     * The payment element writes the picked method type into `paymentMethod`,
     * so restore the saved-method selection when switching back to the tab.
     */
    form.setValue(
      "paymentMethod",
      paymentGatewayMethods.find(({ isDefault }) => isDefault)?.id ??
        paymentGatewayMethods?.[0]?.id,
    );
    setIsMounted(false);
  }, [form, isAddingNewPaymentMethod, paymentGatewayMethods]);

  useEffect(() => {
    if (!isInitialized || !isAddingNewPaymentMethod) {
      return;
    }

    let isCancelled = false;

    void (async () => {
      /**
       * Using a new payment method requires a new intent secret which the
       * payment element is then created against.
       */
      if (isMarketplacePayment) {
        if (!marketplaceIntentKey || marketplaceIntentCheckouts.length === 0) {
          return;
        }

        if (marketplaceIntentInitializedRef.current === marketplaceIntentKey) {
          return;
        }

        if (marketplaceIntentInFlightRef.current === marketplaceIntentKey) {
          return;
        }

        marketplaceIntentInFlightRef.current = marketplaceIntentKey;
        setIsMounted(false);
        setTransactionData(undefined);

        const result = await initializeMarketplacePaymentIntent({
          buyerId: user?.id,
          checkouts: marketplaceIntentCheckouts,
        });

        if (marketplaceIntentInFlightRef.current === marketplaceIntentKey) {
          marketplaceIntentInFlightRef.current = null;
        }

        if (!result.ok) {
          setErrors(result.errors.map(({ code }) => code));

          return;
        }

        marketplaceIntentInitializedRef.current = marketplaceIntentKey;
        setTransactionData({ clientSecret: result.data.clientSecret });

        return;
      }

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
    isMarketplacePayment,
    marketplaceIntentCheckouts,
    marketplaceIntentKey,
    paymentGatewayCustomer,
    saveForFutureUse,
    user?.id,
  ]);

  useEffect(() => {
    if (errorCode) {
      router.replace(pathname);
    }
  }, [errorCode]);

  useEffect(() => {
    if (sameAsShippingAddress) {
      form.unregister("billingAddress");
    } else if (checkout.billingAddress) {
      const address = addressToSchema(checkout.billingAddress);

      Object.entries(address).forEach(([field, value]) =>
        form.resetField(`billingAddress.${field}` as BillingAddressPath, {
          defaultValue: value as BillingAddressValue,
        }),
      );
    } else if (defaultBillingAddress) {
      form.resetField("billingAddress", {
        defaultValue: formattedToSchemaDefaultBillingAddress,
      });
    } else {
      form.resetField("billingAddress", {
        defaultValue: defaultEmptyBillingAddress,
      });
    }
  }, [sameAsShippingAddress]);

  useEffect(() => {
    if (billingAddressCountry && billingAddressCountry !== countryCode) {
      router.push(
        paths.checkout.asPath({
          query: { step: "payment", country: billingAddressCountry },
        }),
        { scroll: false },
      );
    }
  }, [billingAddressCountry]);

  useEffect(() => {
    setIsCountryChanging(false);
  }, [addressActiveTab]);

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
              <div className={cn({ "pointer-events-none": !isMounted })}>
                <PaymentElement
                  email={checkout.email}
                  fullName={fullName}
                  initializeData={initializeData}
                  isDisabled={isProcessing}
                  isMounted={isMounted}
                  locale={region.language.locale}
                  onReady={() => setIsMounted(true)}
                  ref={elementsRef}
                  transactionData={transactionData}
                />

                {user && (
                  <CheckboxField
                    className="mt-6"
                    name="saveForFutureUse"
                    disabled={!isMounted || isProcessing}
                    label={t("payment.save-method")}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-6">
            <h3 className="text-base font-normal leading-7 text-muted-foreground">
              {t("payment.billing-address")}
            </h3>

            {checkout.isShippingRequired && (
              <div className="flex w-full items-center gap-2 rounded-md border border-input bg-background px-4">
                <CheckboxField
                  label={t("payment.same-as-shipping-address")}
                  name="sameAsShippingAddress"
                />
              </div>
            )}

            {user ? (
              <>
                {!sameAsShippingAddress && (
                  <AddressTab
                    activeTab={addressActiveTab}
                    setActiveTab={setAddressActiveTab}
                    addresses={formattedAddresses}
                    addressFormRows={addressFormRows}
                    countries={countries}
                    countryCode={countryCode}
                    isDisabled={isProcessing}
                    setIsCountryChanging={setIsCountryChanging}
                  />
                )}
              </>
            ) : (
              <>
                {!sameAsShippingAddress && (
                  <AddressForm
                    addressFormRows={addressFormRows}
                    schemaPrefix="billingAddress"
                    countries={countries}
                    onCountryChange={setIsProcessing}
                    isDisabled={isProcessing}
                  />
                )}
              </>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={isCountryChanging || !canProceed || isProcessing}
              className="!mt-8 flex w-full items-center gap-1.5"
              loading={isLoading}
            >
              <span className="flex items-center gap-2">
                <LockIcon size={16} />
                {t("payment.placeOrder")}
              </span>
            </Button>

            {errors.map((code, index) => (
              <p
                key={`${code}-${index}`}
                className="text-sm font-medium text-destructive"
              >
                {t(`errors.${code}`)}
              </p>
            ))}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
