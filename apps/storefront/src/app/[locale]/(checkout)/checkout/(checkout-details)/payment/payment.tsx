"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type CountryOption } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { type PaymentMethod } from "@nimara/domain/objects/Payment";
import { type User } from "@nimara/domain/objects/User";
import { ADDRESS_DEFAULT_VALUES } from "@nimara/infrastructure/consts";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";
import { Spinner } from "@nimara/ui/components/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nimara/ui/components/tabs";
import { useToast } from "@nimara/ui/hooks";

import { AddressForm } from "@/components/address-form/address-form";
import { CheckboxField } from "@/components/form/checkbox-field";
import { PaymentMethods } from "@/components/payment-methods";
import { usePathname, useRouter } from "@/i18n/routing";
import { addressToSchema } from "@/lib/address";
import { type FormattedAddress } from "@/lib/checkout";
import { PAYMENT_ELEMENT_ID } from "@/lib/consts";
import { isGlobalError } from "@/lib/errors";
import { paths } from "@/lib/paths";
import { translateApiErrors } from "@/lib/payment";
import { type Maybe } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCurrentRegion } from "@/regions/client";
import { getPaymentService } from "@/services/payment";

import { updateBillingAddress } from "./actions";
import { AddressTab } from "./address-tab";
import {
  canProceedMarketplacePayment,
  type MarketplacePhase,
} from "./marketplace-phase";
import {
  type BillingAddressPath,
  type BillingAddressValue,
  type Schema,
  schema,
} from "./schema";

export type TabName = "new" | "saved";

type MarketplacePrepareResponse = {
  clientSecret?: string;
  errors?: Array<{
    code: AppErrorCode;
  }>;
  orderIds?: string[];
};

type PaymentProps = {
  addressFormRows: readonly AddressFormRow[];
  checkout: Checkout;
  countries: CountryOption[];
  countryCode: AllCountryCode;
  errorCode?: AppErrorCode;
  formattedAddresses: FormattedAddress[];
  marketplaceBuyerId: string;
  marketplaceCheckoutIds: string[];
  marketplaceMode: boolean;
  paymentGatewayCustomer: Maybe<string>;
  paymentGatewayMethods: PaymentMethod[];
  storeUrl: string;
  user: User | null;
};

export const Payment = ({
  checkout,
  errorCode,
  marketplaceMode,
  marketplaceCheckoutIds,
  marketplaceBuyerId,
  storeUrl,
  addressFormRows,
  countries,
  countryCode,
  paymentGatewayMethods,
  paymentGatewayCustomer,
  formattedAddresses,
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
  const [marketplacePhase, setMarketplacePhase] =
    useState<MarketplacePhase>("prepare");
  const [marketplaceClientSecret, setMarketplaceClientSecret] = useState<
    string | null
  >(null);
  const [marketplaceOrderIds, setMarketplaceOrderIds] = useState<string[]>([]);
  const hasSavedPaymentMethods =
    !marketplaceMode && paymentGatewayMethods.length > 0;
  const [activeTab, setActiveTab] = useState<TabName>(
    hasSavedPaymentMethods && !marketplaceMode ? "saved" : "new",
  );
  const [addressActiveTab, setAddressActiveTab] = useState<TabName>(
    formattedAddresses.length ? "saved" : "new",
  );
  const [errors, setErrors] = useState<(string | ReactNode)[]>(
    errorCode
      ? [
          translateApiErrors({
            t,
            errors: [{ code: errorCode }],
          }),
        ]
      : [],
  );

  const defaultBillingAddress = formattedAddresses[0]?.address;
  const formattedToSchemaDefaultBillingAddress = {
    ...addressToSchema(defaultBillingAddress),
    id: defaultBillingAddress?.id,
  };
  const defaultEmptyBillingAddress = {
    ...ADDRESS_DEFAULT_VALUES,
    country: countryCode,
  } as Schema["billingAddress"];
  const hasDefaultBillingAddress =
    formattedAddresses[0]?.address.isDefaultBillingAddress;
  const supportedCountryCodesInChannel = countries?.map(({ value }) => value);
  const hasDefaultBillingAddressInCurrentChannel =
    supportedCountryCodesInChannel.includes(defaultBillingAddress?.country);
  const saveAddressForFutureUse = !!(user && addressActiveTab === "new");

  const form = useForm<Schema>({
    resolver: zodResolver(schema({ t, addressFormRows })),
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
        paymentGatewayMethods?.[0]?.id,
    },
  });

  const billingAddressCountry = form.getValues("billingAddress.country");

  const [saveForFutureUse, sameAsShippingAddress, paymentMethod] = form.watch([
    "saveForFutureUse",
    "sameAsShippingAddress",
    "paymentMethod",
  ]);
  const hasSelectedPaymentMethod = !!paymentMethod;
  const isAddingNewPaymentMethod = marketplaceMode || activeTab === "new";
  const isLoading = !isInitialized || isProcessing;
  const canProceed =
    !isLoading &&
    (marketplaceMode
      ? canProceedMarketplacePayment({
          phase: marketplacePhase,
          isLoading,
          isMounted,
          clientSecret: marketplaceClientSecret,
          orderIdsCount: marketplaceOrderIds.length,
        })
      : isAddingNewPaymentMethod
        ? isMounted
        : hasSelectedPaymentMethod);

  const isDark = resolvedTheme === "dark";
  const marketplaceBillingInfoText = t.has(
    "payment.marketplaceUsesShippingAsBilling",
  )
    ? t("payment.marketplaceUsesShippingAsBilling")
    : "Billing address is the same as your shipping address in marketplace checkout.";
  const appearance = {
    theme: (isDark ? "night" : "stripe") as "night" | "stripe",
    variables: {
      colorBackground: isDark ? "#1C1917" : "#fff",
    },
  };

  const handlePlaceOrder: SubmitHandler<Schema> = async ({
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

    if (!marketplaceMode) {
      delete billingAddress?.id;
    }

    const billingInput = marketplaceMode
      ? {
          sameAsShippingAddress: true,
          saveAddressForFutureUse: false,
          billingAddress: undefined,
        }
      : {
          sameAsShippingAddress,
          saveAddressForFutureUse,
          billingAddress,
        };

    if (!(marketplaceMode && marketplacePhase === "confirm")) {
      const result = await updateBillingAddress({
        checkout,
        input: billingInput,
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

    if (marketplaceMode && marketplacePhase === "prepare") {
      try {
        const response = await fetch("/api/payments/marketplace/prepare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            buyerId: marketplaceBuyerId,
            checkoutIds: marketplaceCheckoutIds,
            languageCode: region.language.code,
            countryCode,
            channel: region.market.channel,
          }),
        });
        const payload = (await response
          .json()
          .catch(() => ({}))) as MarketplacePrepareResponse;

        if (
          !response.ok ||
          !payload.clientSecret ||
          !payload.orderIds?.length
        ) {
          setErrors(
            translateApiErrors({
              t,
              errors: payload.errors?.length
                ? payload.errors
                : [{ code: "CHECKOUT_COMPLETE_ERROR" }],
            }),
          );
          setIsProcessing(false);

          return;
        }

        const paymentService = await getPaymentService();
        const clientSecret = payload.clientSecret;

        setMarketplaceOrderIds(payload.orderIds);
        setMarketplaceClientSecret(clientSecret);

        const data = await paymentService.paymentElementCreate({
          locale: region.language.locale,
          secret: clientSecret,
          appearance,
        });

        if (document.getElementById(PAYMENT_ELEMENT_ID)) {
          data.mount(`#${PAYMENT_ELEMENT_ID}`);
          setIsMounted(true);
        }

        setMarketplacePhase("confirm");
        setIsProcessing(false);

        return;
      } catch {
        setErrors(
          translateApiErrors({
            t,
            errors: [{ code: "CHECKOUT_COMPLETE_ERROR" }],
          }),
        );
        setIsProcessing(false);

        return;
      }
    }

    let paymentSecret: Maybe<string> = undefined;
    const redirectUrl = new URL(paths.payment.confirmation.asPath(), storeUrl);
    const finalRedirectUrl = (() => {
      if (!marketplaceMode) {
        return redirectUrl.toString();
      }

      if (!marketplaceOrderIds.length) {
        setErrors([t("errors.TRANSACTION_INITIALIZE_ERROR")]);
        setIsProcessing(false);

        return null;
      }

      redirectUrl.searchParams.set("marketplace", "1");
      redirectUrl.searchParams.set("orderIds", marketplaceOrderIds.join(","));

      return redirectUrl.toString();
    })();

    if (!finalRedirectUrl) {
      return;
    }

    const paymentService = await getPaymentService();

    /**
     * Using existing payment method requires passing it to the stripe app to
     * tokenize it and obtain a secret, which needs to be passed to
     * paymentExecute.
     */

    if (!marketplaceMode && paymentMethod) {
      const result = await paymentService.paymentGatewayTransactionInitialize({
        id: checkout.id,
        amount: checkout.totalPrice.gross.amount,
        paymentMethod,
        customerId: paymentGatewayCustomer,
        saveForFutureUse,
      });

      if (!result.ok) {
        setErrors(translateApiErrors({ t, errors: result.errors }));
        setIsProcessing(false);

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
      redirectUrl: finalRedirectUrl,
    });

    if (!result.ok) {
      setErrors(translateApiErrors({ t, errors: result.errors }));
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    void (async () => {
      const paymentService = await getPaymentService();

      await paymentService.paymentInitialize();

      if (marketplaceMode) {
        setIsInitialized(true);

        return;
      }

      const result = await paymentService.paymentGatewayInitialize({
        id: checkout.id,
        amount: checkout.totalPrice.gross.amount,
      });

      if (!result.ok) {
        setErrors(translateApiErrors({ t, errors: result.errors }));
      } else {
        setIsInitialized(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isInitialized || marketplaceMode) {
      return;
    }

    void (async () => {
      const paymentService = await getPaymentService();

      /**
       * Using new payment method requires an new intent secret which is then passed
       * to paymentElementCreate.
       */
      if (isAddingNewPaymentMethod) {
        let secret: string;

        {
          const result =
            await paymentService.paymentGatewayTransactionInitialize({
              id: checkout.id,
              amount: checkout.totalPrice.gross.amount,
              customerId: paymentGatewayCustomer,
              saveForFutureUse,
            });

          if (!result.ok) {
            return setErrors(translateApiErrors({ t, errors: result.errors }));
          } else {
            secret = result.data.clientSecret;
          }
        }

        const data = await paymentService.paymentElementCreate({
          locale: region.language.locale,
          secret: secret!,
          appearance,
        });

        if (document.getElementById(PAYMENT_ELEMENT_ID)) {
          data.mount(`#${PAYMENT_ELEMENT_ID}`);

          setIsMounted(true);
        }
      }
    })();

    if (isAddingNewPaymentMethod) {
      form.setValue("paymentMethod", undefined);
    }
  }, [activeTab, saveForFutureUse, isInitialized]);

  useEffect(() => {
    setIsMounted(false);
  }, [saveForFutureUse, activeTab]);

  useEffect(() => {
    if (errorCode) {
      router.replace(pathname);
    }
  }, [errorCode]);

  useEffect(() => {
    if (marketplaceMode) {
      return;
    }

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
  }, [sameAsShippingAddress, marketplaceMode]);

  useEffect(() => {
    if (marketplaceMode) {
      return;
    }

    if (billingAddressCountry && billingAddressCountry !== countryCode) {
      router.push(
        paths.checkout.payment.asPath({
          query: { country: billingAddressCountry },
        }),
        { scroll: false },
      );
    }
  }, [billingAddressCountry, marketplaceMode]);

  useEffect(() => {
    setIsCountryChanging(false);
  }, [countryCode, addressActiveTab]);

  return (
    <Form {...form}>
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
              {!isMounted &&
                (!marketplaceMode || marketplacePhase === "confirm") && (
                  <div className={cn("flex w-full justify-center py-16")}>
                    <Spinner />
                  </div>
                )}
              <div className={cn({ "pointer-events-none": !isMounted })}>
                <div
                  className={cn({ hidden: !isMounted })}
                  id={PAYMENT_ELEMENT_ID}
                />

                {marketplaceMode && marketplacePhase === "prepare" && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {marketplaceBillingInfoText}
                  </p>
                )}

                {marketplaceMode &&
                  marketplacePhase === "confirm" &&
                  !isMounted && (
                    <p className="mt-6 text-sm text-muted-foreground">
                      {t("payment.enterPaymentDetails")}
                    </p>
                  )}

                {user && !marketplaceMode && (
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

          {!marketplaceMode && (
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
          )}
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={isCountryChanging || !canProceed || isProcessing}
              className="!mt-8 flex w-full items-center gap-1.5"
              loading={isLoading}
            >
              <span className="flex items-center gap-2">
                <LockIcon size={16} />
                {marketplaceMode && marketplacePhase === "prepare"
                  ? t("payment.preparePayment")
                  : t("payment.placeOrder")}
              </span>
            </Button>

            {errors.map((message, i) => (
              <p key={i} className="text-sm font-medium text-destructive">
                {message}
              </p>
            ))}
          </div>
        </div>
      </form>
    </Form>
  );
};
