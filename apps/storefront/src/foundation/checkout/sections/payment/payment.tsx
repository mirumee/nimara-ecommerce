"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
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
import { addressToSchema } from "@nimara/foundation/address/address";
import { AddressForm } from "@nimara/foundation/address/address-form/address-form";
import type { FormattedAddress } from "@nimara/foundation/address/types";
import { CheckboxField } from "@nimara/foundation/form-components/checkbox-field";
import { usePathname, useRouter } from "@nimara/i18n/routing";
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
import { cn } from "@nimara/ui/lib/utils";

import { clientEnvs } from "@/envs/client";
import { PAYMENT_ELEMENT_ID } from "@/features/checkout/consts";
import { PaymentMethods } from "@/features/checkout/payment-methods";
import { type MarketplaceCheckoutItem } from "@/features/checkout/types";
import {
  initializeMarketplacePaymentIntent,
  updateBillingAddress,
} from "@/foundation/checkout/sections/payment/actions";
import {
  type BillingAddressPath,
  type BillingAddressValue,
  type PaymentSchema,
  paymentSchema,
} from "@/foundation/checkout/sections/payment/schema";
import { isGlobalError } from "@/foundation/errors/errors";
import { useCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { createPaymentServiceLoader } from "@/services/lazy-loaders/payment";
import { storefrontLogger } from "@/services/logging";

import { AddressTab } from "./tabs/address-tab";

export type TabName = "new" | "saved";

const paymentServiceLoader = createPaymentServiceLoader(storefrontLogger);

type PaymentProps = {
  addressFormRows: readonly AddressFormRow[];
  checkout: Checkout;
  countries: CountryOption[];
  countryCode: AllCountryCode;
  errorCode?: AppErrorCode;
  formattedAddresses: FormattedAddress[];
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
  const { resolvedTheme } = useTheme();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
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
  const [paymentElementSecret, setPaymentElementSecret] =
    useState<Maybe<string>>(undefined);
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
  const isLoading = !isInitialized || isProcessing;
  const canProceed =
    !isLoading &&
    (isMarketplacePayment
      ? isMounted
      : isAddingNewPaymentMethod
        ? isMounted
        : hasSelectedPaymentMethod);

  const isDark = resolvedTheme === "dark";

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

    let paymentSecret: Maybe<string> = undefined;
    const redirectUrl = `${storeUrl}${paths.payment.confirmation.asPath()}`;
    const paymentService = await paymentServiceLoader();

    /**
     * Using existing payment method requires passing it to the stripe app to
     * tokenize it and obtain a secret, which needs to be passed to
     * paymentExecute.
     */

    if (!isMarketplacePayment && paymentMethod) {
      const result = await paymentService.paymentGatewayTransactionInitialize({
        id: checkout.id,
        amount: checkout.totalPrice.gross.amount,
        paymentMethod,
        customerId: paymentGatewayCustomer,
        saveForFutureUse,
      });

      if (!result.ok) {
        setErrors(result.errors.map(({ code }) => code));
        setIsProcessing(false);
        router.refresh();

        return;
      }

      paymentSecret = result.data.clientSecret;
    }

    const result = await paymentService.paymentExecute({
      billingDetails: {
        ...checkout.billingAddress,
        country: checkout.billingAddress?.country,
      },
      paymentSecret,
      redirectUrl,
    });

    if (!result.ok) {
      setErrors(result.errors.map(({ code }) => code));
      setIsProcessing(false);
      router.refresh();
    }
  };

  useEffect(() => {
    void (async () => {
      const paymentService = await paymentServiceLoader();

      if (isMarketplacePayment) {
        await paymentService.paymentInitialize();
        setIsInitialized(true);

        return;
      }

      const [result] = await Promise.all([
        paymentService.paymentGatewayInitialize({
          id: checkout.id,
          amount: checkout.totalPrice.gross.amount,
        }),
        paymentService.paymentInitialize(),
      ]);

      if (!result.ok) {
        setErrors(result.errors.map(({ code }) => code));

        return;
      }

      setIsInitialized(true);
    })();
  }, [checkout.id, checkout.totalPrice.gross.amount, isMarketplacePayment]);

  useEffect(() => {
    if (isAddingNewPaymentMethod) {
      form.setValue("paymentMethod", undefined);

      return;
    }

    setIsMounted(false);
  }, [form, isAddingNewPaymentMethod]);

  useEffect(() => {
    if (!isInitialized || !isAddingNewPaymentMethod) {
      return;
    }

    let isCancelled = false;

    void (async () => {
      const paymentService = await paymentServiceLoader();

      /**
       * Using new payment method requires an new intent secret which is then passed
       * to paymentElementCreate.
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
        setPaymentElementSecret(undefined);

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
        setPaymentElementSecret(result.data.clientSecret);

        return;
      }

      setIsMounted(false);
      setPaymentElementSecret(undefined);

      const result = await paymentService.paymentGatewayTransactionInitialize({
        id: checkout.id,
        amount: checkout.totalPrice.gross.amount,
        customerId: paymentGatewayCustomer,
        saveForFutureUse,
      });

      if (isCancelled) {
        return;
      }

      if (!result.ok) {
        setErrors(result.errors.map(({ code }) => code));

        return;
      }

      setPaymentElementSecret(result.data.clientSecret);
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
    if (!isInitialized || !isAddingNewPaymentMethod || !paymentElementSecret) {
      return;
    }

    let isCancelled = false;
    let unmountPaymentElement: (() => void) | undefined;

    setIsMounted(false);

    void (async () => {
      const paymentService = await paymentServiceLoader();
      const data = await paymentService.paymentElementCreate({
        locale: region.language.locale,
        secret: paymentElementSecret,
        appearance: {
          theme: isDark ? "night" : "flat",
          variables: {
            borderRadius: "5px",
          },
        },
        options: {
          layout: {
            type: "accordion",
            paymentMethodLogoPosition: "start",
            defaultCollapsed: false,
          },
        },
      });

      if (isCancelled) {
        return;
      }

      if (document.getElementById(PAYMENT_ELEMENT_ID)) {
        data.mount(`#${PAYMENT_ELEMENT_ID}`);
        unmountPaymentElement = data.unmount;
        setIsMounted(true);
      }
    })();

    return () => {
      isCancelled = true;
      unmountPaymentElement?.();
    };
  }, [
    isAddingNewPaymentMethod,
    isDark,
    isInitialized,
    paymentElementSecret,
    region.language.locale,
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
              {!isMounted && (
                <div className={cn("flex w-full justify-center py-16")}>
                  <Spinner />
                </div>
              )}
              <div className={cn({ "pointer-events-none": !isMounted })}>
                {/* THIS IS THE PLACE WHERE THE PAYMENT ELEMENT IS MOUNTED */}
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
                {t(`errors.${code}`)}
              </p>
            ))}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
