"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  loadStripe,
  type StripeElementLocale,
  type StripeElements,
} from "@stripe/stripe-js";
import { LockIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { type User } from "@nimara/domain/objects/User";
import { addressToSchema } from "@nimara/foundation/address/address";
import { AddressForm } from "@nimara/foundation/address/address-form/address-form";
import { CheckboxField } from "@nimara/foundation/form-components/checkbox-field";
import { cn } from "@nimara/foundation/lib/cn";
import { usePathname, useRouter } from "@nimara/i18n/routing";
import { type MessagePath } from "@nimara/i18n/types";
import { ADDRESS_DEFAULT_VALUES } from "@nimara/infrastructure/consts";
import { Button } from "@nimara/ui/components/button";
import { Spinner } from "@nimara/ui/components/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nimara/ui/components/tabs";
import { useToast } from "@nimara/ui/hooks";

import { clientEnvs } from "@/envs/client";
import { PAYMENT_ELEMENT_ID } from "@/features/checkout/consts";
import { PaymentMethods } from "@/features/checkout/payment-methods";
import { isGlobalError } from "@/foundation/errors/errors";
import { useCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";

import {
  initializePaymentGateway,
  initializePaymentTransaction,
  updateBillingAddress,
} from "./actions";
import {
  type BillingAddressPath,
  type PaymentSchema,
  paymentSchema,
} from "./schema";
import { AddressTab } from "./tabs/address-tab";
import { type PaymentSectionData } from "./types";
import { type TabName } from "./types/internal";

const STRIPE_TRANSACTION_QUERY_PARAM = "transactionId";
const STRIPE_LOCALE_MAP: Record<string, string> = {
  "en-US": "en",
};
const STRIPE_ERROR_CODE_MAP: Partial<Record<string, AppErrorCode>> = {
  expired_card: "GENERIC_CARD_ERROR",
  incorrect_cvc: "GENERIC_CARD_ERROR",
  card_declined: "GENERIC_CARD_ERROR",
  processing_error: "PAYMENT_PROCESSING_ERROR",
};

interface PaymentElementRef {
  mount: (domElement: string | HTMLElement) => void;
  unmount: () => void;
  update: (options: { readOnly: boolean }) => void;
}

interface PaymentFormProps {
  checkout: Checkout;
  paymentSectionData: PaymentSectionData;
  user: User | null;
}

export const PaymentForm = ({
  checkout,
  paymentSectionData: {
    addressFormRows,
    countries,
    countryCode,
    errorCode,
    formattedAddresses,
    paymentGatewayCustomer,
    paymentGatewayMethods,
    storeUrl,
  },
  user,
}: PaymentFormProps) => {
  const t = useTranslations();

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const region = useCurrentRegion();
  const { resolvedTheme } = useTheme();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isCountryChanging, setIsCountryChanging] = useState(false);
  const [errors, setErrors] = useState<AppErrorCode[]>(
    errorCode ? [errorCode] : [],
  );
  const hasSavedPaymentMethods = paymentGatewayMethods.length > 0;
  const [activeTab, setActiveTab] = useState<TabName>(
    hasSavedPaymentMethods ? "saved" : "new",
  );
  const [addressActiveTab, setAddressActiveTab] = useState<TabName>(
    formattedAddresses.length ? "saved" : "new",
  );

  const elementsRef = useRef<unknown>(null);
  const paymentElementRef = useRef<PaymentElementRef | null>(null);
  const stripePromiseRef = useRef(loadStripe(clientEnvs.STRIPE_PUBLIC_KEY));
  const transactionRef = useRef<{
    clientSecret: string;
    transactionId: string;
  } | null>(null);

  const defaultBillingAddress = formattedAddresses.find(
    ({ address }) => address.isDefaultBillingAddress,
  )?.address;
  const formattedToSchemaDefaultBillingAddress = useMemo(
    () => ({
      ...ADDRESS_DEFAULT_VALUES,
      ...(defaultBillingAddress
        ? addressToSchema(defaultBillingAddress)
        : ADDRESS_DEFAULT_VALUES),
      id: defaultBillingAddress?.id,
    }),
    [defaultBillingAddress],
  );
  const defaultEmptyBillingAddress = useMemo(
    () =>
      ({
        ...ADDRESS_DEFAULT_VALUES,
        country: countryCode,
      }) satisfies PaymentSchema["billingAddress"],
    [countryCode],
  );
  const hasDefaultBillingAddress =
    formattedAddresses[0]?.address.isDefaultBillingAddress;
  const supportedCountryCodesInChannel = countries.map(({ value }) => value);
  const hasDefaultBillingAddressInCurrentChannel =
    !!defaultBillingAddress?.country &&
    supportedCountryCodesInChannel.includes(defaultBillingAddress.country);
  const saveAddressForFutureUse = !!(user && addressActiveTab === "new");

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
      paymentMethod:
        paymentGatewayMethods.find(({ isDefault }) => isDefault)?.id ??
        paymentGatewayMethods[0]?.id,
    },
  });

  const billingAddressCountry = form.getValues("billingAddress.country");
  const [saveForFutureUse, sameAsShippingAddress, paymentMethod] = form.watch([
    "saveForFutureUse",
    "sameAsShippingAddress",
    "paymentMethod",
  ]);
  const hasSelectedPaymentMethod = !!paymentMethod;
  const isAddingNewPaymentMethod = activeTab === "new";
  const isLoading = !isInitialized || isProcessing;
  const canProceed =
    !isLoading &&
    (isAddingNewPaymentMethod ? isMounted : hasSelectedPaymentMethod);

  const isDark = resolvedTheme === "dark";

  const getStripeClient = async () => {
    return stripePromiseRef.current;
  };

  const getPaymentConfirmationUrl = (transactionId: string) => {
    const returnUrl = new URL(paths.payment.confirmation.asPath(), storeUrl);

    returnUrl.searchParams.append(
      STRIPE_TRANSACTION_QUERY_PARAM,
      transactionId,
    );

    return returnUrl.toString();
  };

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

    const resultUpdateBillingAddress = await updateBillingAddress({
      checkout,
      input: {
        sameAsShippingAddress,
        saveAddressForFutureUse,
        billingAddress,
      },
    });

    if (!resultUpdateBillingAddress.ok) {
      resultUpdateBillingAddress.errors.forEach(({ field, code }) => {
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

    const stripe = await getStripeClient();

    if (!stripe) {
      setErrors(["GENERIC_PAYMENT_ERROR"]);
      setIsProcessing(false);

      return;
    }

    let transactionId: string;
    let paymentSecret: string | undefined;

    if (paymentMethod) {
      const resultInitializeTransaction = await initializePaymentTransaction({
        id: checkout.id,
        amount: checkout.totalPrice.gross.amount,
        paymentMethod,
        customerId: paymentGatewayCustomer,
        saveForFutureUse,
      });

      if (!resultInitializeTransaction.ok) {
        setErrors(resultInitializeTransaction.errors.map(({ code }) => code));
        setIsProcessing(false);

        return;
      }

      transactionId = resultInitializeTransaction.data.transactionId;
      paymentSecret = resultInitializeTransaction.data.clientSecret;
    } else {
      if (!transactionRef.current) {
        const resultInitializeTransaction = await initializePaymentTransaction({
          id: checkout.id,
          amount: checkout.totalPrice.gross.amount,
          customerId: paymentGatewayCustomer,
          saveForFutureUse,
        });

        if (!resultInitializeTransaction.ok) {
          setErrors(resultInitializeTransaction.errors.map(({ code }) => code));
          setIsProcessing(false);

          return;
        }

        transactionRef.current = resultInitializeTransaction.data;
      }

      transactionId = transactionRef.current.transactionId;
    }

    const isUsingNewPaymentMethod = !paymentSecret;

    if (
      isUsingNewPaymentMethod &&
      (!elementsRef.current || !paymentElementRef.current)
    ) {
      setErrors(["GENERIC_PAYMENT_ERROR"]);
      setIsProcessing(false);

      return;
    }

    if (isUsingNewPaymentMethod) {
      paymentElementRef.current?.update({ readOnly: true });
    }

    // TODO(refactor): `checkout` prop can be stale after `updateBillingAddress` succeeds.
    const billingDetails = checkout.billingAddress;
    const billingName = [billingDetails?.firstName, billingDetails?.lastName]
      .filter(Boolean)
      .join(" ");

    const confirmParams = {
      return_url: getPaymentConfirmationUrl(transactionId),
      payment_method_data: {
        billing_details: {
          email: checkout.email ?? undefined,
          name: billingName || undefined,
          address: {
            line1: billingDetails?.streetAddress1 ?? undefined,
            line2: billingDetails?.streetAddress2 ?? undefined,
            state: billingDetails?.countryArea ?? undefined,
            country: billingDetails?.country ?? undefined,
            postal_code: billingDetails?.postalCode ?? undefined,
          },
        },
      },
    };
    const resultConfirm = paymentSecret
      ? await stripe.confirmPayment({
          clientSecret: paymentSecret,
          redirect: "always",
          confirmParams,
        })
      : await stripe.confirmPayment({
          elements: elementsRef.current as StripeElements,
          redirect: "always",
          confirmParams,
        });

    if (isUsingNewPaymentMethod) {
      paymentElementRef.current?.update({ readOnly: false });
    }

    if (resultConfirm.error) {
      const code = STRIPE_ERROR_CODE_MAP[resultConfirm.error.code ?? ""] as
        | AppErrorCode
        | undefined;

      setErrors([code ?? "GENERIC_PAYMENT_ERROR"]);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let isDisposed = false;

    void (async () => {
      const [stripe, resultInitializeGateway] = await Promise.all([
        getStripeClient(),
        initializePaymentGateway({
          id: checkout.id,
          amount: checkout.totalPrice.gross.amount,
        }),
      ]);

      if (isDisposed) {
        return;
      }

      if (!stripe) {
        setErrors(["GENERIC_PAYMENT_ERROR"]);

        return;
      }

      if (!resultInitializeGateway.ok) {
        setErrors(resultInitializeGateway.errors.map(({ code }) => code));

        return;
      }

      setIsInitialized(true);
    })();

    return () => {
      isDisposed = true;
    };
  }, [checkout.id, checkout.totalPrice.gross.amount]);

  useEffect(() => {
    let isDisposed = false;

    if (!isInitialized || !isAddingNewPaymentMethod) {
      return;
    }

    void (async () => {
      setIsMounted(false);
      form.setValue("paymentMethod", undefined);
      paymentElementRef.current?.unmount();
      paymentElementRef.current = null;
      elementsRef.current = null;
      transactionRef.current = null;

      const resultInitializeTransaction = await initializePaymentTransaction({
        id: checkout.id,
        amount: checkout.totalPrice.gross.amount,
        customerId: paymentGatewayCustomer,
        saveForFutureUse,
      });

      if (!resultInitializeTransaction.ok) {
        if (!isDisposed) {
          setErrors(resultInitializeTransaction.errors.map(({ code }) => code));
        }

        return;
      }

      const stripe = await getStripeClient();

      if (!stripe || isDisposed) {
        return;
      }

      const elements = stripe.elements({
        clientSecret: resultInitializeTransaction.data.clientSecret,
        locale: (STRIPE_LOCALE_MAP[region.language.locale] ??
          region.language.locale) as StripeElementLocale,
        appearance: {
          theme: isDark ? "night" : "stripe",
          variables: {
            focusBoxShadow: "0 none",
            borderRadius: "0",
          },
        },
      });

      const paymentElement = elements.create("payment", {
        layout: {
          type: "accordion",
          radios: false,
        },
      });

      if (document.getElementById(PAYMENT_ELEMENT_ID)) {
        paymentElement.mount(`#${PAYMENT_ELEMENT_ID}`);
      }

      elementsRef.current = elements;
      paymentElementRef.current =
        paymentElement as unknown as PaymentElementRef;
      transactionRef.current = resultInitializeTransaction.data;

      if (!isDisposed) {
        setIsMounted(true);
      }
    })();

    return () => {
      isDisposed = true;
      paymentElementRef.current?.unmount();
      paymentElementRef.current = null;
      elementsRef.current = null;
      transactionRef.current = null;
    };
  }, [
    activeTab,
    checkout.id,
    checkout.totalPrice.gross.amount,
    form,
    isAddingNewPaymentMethod,
    isDark,
    isInitialized,
    paymentGatewayCustomer,
    region.language.locale,
    saveForFutureUse,
  ]);

  useEffect(() => {
    if (errorCode) {
      // TODO(refactor): We currently clear all query params to remove `errorCode`.
      router.replace(pathname);
    }
  }, [errorCode, pathname, router]);

  useEffect(() => {
    if (sameAsShippingAddress) {
      form.unregister("billingAddress");
    } else if (checkout.billingAddress) {
      const address = addressToSchema(checkout.billingAddress);

      Object.entries(address).forEach(([field, value]) =>
        form.resetField(`billingAddress.${field}` as BillingAddressPath, {
          defaultValue: value as never,
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
  }, [
    checkout.billingAddress,
    defaultBillingAddress,
    defaultEmptyBillingAddress,
    form,
    formattedToSchemaDefaultBillingAddress,
    sameAsShippingAddress,
  ]);

  useEffect(() => {
    if (billingAddressCountry && billingAddressCountry !== countryCode) {
      router.push(
        paths.checkout.asPath({
          query: { step: "payment", country: billingAddressCountry },
        }),
        { scroll: false },
      );
    }
  }, [billingAddressCountry, countryCode, router]);

  useEffect(() => {
    setIsCountryChanging(false);
  }, [addressActiveTab, countryCode]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handlePlaceOrder)} noValidate>
        <div className="mb-8 space-y-6">
          <Tabs
            defaultValue={activeTab}
            onValueChange={(value) => setActiveTab(value as TabName)}
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
              {!isMounted && (
                <div className={cn("flex w-full justify-center py-16")}>
                  <Spinner />
                </div>
              )}
              <div className={cn({ "pointer-events-none": !isMounted })}>
                <div
                  className={cn({ hidden: !isMounted })}
                  id={PAYMENT_ELEMENT_ID}
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
                {t(`errors.${code}` as MessagePath)}
              </p>
            ))}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
