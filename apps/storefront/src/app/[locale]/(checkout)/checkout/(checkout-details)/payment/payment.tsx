"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { paymentService } from "@/services/payment";

import { updateBillingAddress } from "./actions";
import { AddressTab } from "./address-tab";
import {
  type BillingAddressPath,
  type BillingAddressValue,
  type Schema,
  schema,
} from "./schema";

export type TabName = "new" | "saved";

type PaymentProps = {
  addressFormRows: readonly AddressFormRow[];
  checkout: Checkout;
  countries: CountryOption[];
  countryCode: AllCountryCode;
  errorCode?: AppErrorCode;
  formattedAddresses: FormattedAddress[];
  paymentGatewayCustomer: Maybe<string>;
  paymentGatewayMethods: PaymentMethod[];
  storeUrl: string;
  user: User | null;
};

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
  user,
}: PaymentProps) => {
  const t = useTranslations();

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const region = useCurrentRegion();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isCountryChanging, setIsCountryChanging] = useState(false);
  const hasSavedPaymentMethods = paymentGatewayMethods.length > 0;
  const [activeTab, setActiveTab] = useState<TabName>(
    hasSavedPaymentMethods ? "saved" : "new",
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
      sameAsShippingAddress: !hasDefaultBillingAddressInCurrentChannel,
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
  const isAddingNewPaymentMethod = activeTab === "new";
  const isLoading = !isInitialized || isProcessing;
  const canProceed =
    !isLoading &&
    (isAddingNewPaymentMethod ? isMounted : hasSelectedPaymentMethod);

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

    delete billingAddress?.id;

    {
      const result = await updateBillingAddress({
        checkout,
        input: {
          sameAsShippingAddress,
          saveAddressForFutureUse,
          billingAddress,
        },
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

    /**
     * Using existing payment method requires passing it to the stripe app to
     * tokenize it and obtain a secret, which needs to be passed to
     * paymentExecute.
     */
    if (paymentMethod) {
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
      redirectUrl,
    });

    if (!result.ok) {
      setErrors(translateApiErrors({ t, errors: result.errors }));
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    void (async () => {
      const [result] = await Promise.all([
        paymentService.paymentGatewayInitialize({
          id: checkout.id,
          amount: checkout.totalPrice.gross.amount,
        }),
        await paymentService.paymentInitialize(),
      ]);

      if (!result.ok) {
        setErrors(translateApiErrors({ t, errors: result.errors }));
      } else {
        setIsInitialized(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    void (async () => {
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
        paths.checkout.payment.asPath({
          query: { country: billingAddressCountry },
        }),
        { scroll: false },
      );
    }
  }, [billingAddressCountry]);

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
            <h3 className="text-muted-foreground text-base font-normal leading-7">
              {t("payment.billing-address")}
            </h3>

            <div className="border-input bg-background flex w-full items-center gap-2 rounded-md border px-4">
              <CheckboxField
                label={t("payment.same-as-shipping-address")}
                name="sameAsShippingAddress"
                disabled={isProcessing}
              />
            </div>

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

            {errors.map((message, i) => (
              <p key={i} className="text-destructive text-sm font-medium">
                {message}
              </p>
            ))}
          </div>
        </div>
      </form>
    </Form>
  );
};
