"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type User } from "@nimara/domain/objects/User";
import { LocalizedLink, useRouter } from "@nimara/i18n/routing";
import { Card } from "@nimara/ui/components/card";
import { Separator } from "@nimara/ui/components/separator";

import { clientEnvs } from "@/envs/client";
import { type MarketplaceCheckoutItem } from "@/features/checkout/types";
import { Payment } from "@/foundation/checkout/sections/payment/payment";
import { CheckoutPaymentSection } from "@/foundation/checkout/sections/payment/section";
import { paths } from "@/foundation/routing/paths";

import { type CheckoutStep } from "../steps";
import { DeliveryMethodForm } from "./delivery-method/form";
import { MarketplaceDeliveryMethodForm } from "./delivery-method/marketplace-form";
import { CheckoutDeliveryMethodSection } from "./delivery-method/section";
import { type PaymentSectionData } from "./payment/types";
import { ShippingAddressForm } from "./shipping-address/form";
import { CheckoutShippingAddressSection } from "./shipping-address/section";
import { type ShippingAddressSectionData } from "./shipping-address/types";
import { UserDetailsForm } from "./user-details/form";
import { CheckoutUserDetailsSection } from "./user-details/section";

interface Props {
  checkout: Checkout;
  marketplaceCheckouts?: MarketplaceCheckoutItem[];
  paymentSectionData: PaymentSectionData | null;
  shippingAddressSectionData: ShippingAddressSectionData | null;
  step: CheckoutStep;
  user: User | null;
}

export const CheckoutSections = ({
  step,
  checkout,
  marketplaceCheckouts,
  paymentSectionData,
  shippingAddressSectionData,
  user,
}: Props) => {
  const t = useTranslations();
  const router = useRouter();
  const isMarketplaceMode =
    clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED &&
    !!marketplaceCheckouts &&
    marketplaceCheckouts.length > 0;
  const checkoutCollection = isMarketplaceMode
    ? marketplaceCheckouts.map((item) => item.checkout)
    : [checkout];
  const emailProvidedForAll = checkoutCollection.every(
    (entry) => entry.email !== null,
  );
  const shippingAddressProvidedForAll = checkoutCollection.every(
    (entry) => !entry.isShippingRequired || entry.shippingAddress !== null,
  );
  const deliveryMethodProvidedForAll = checkoutCollection.every(
    (entry) => !entry.isShippingRequired || entry.deliveryMethod !== null,
  );
  const isShippingRequiredForAny = checkoutCollection.some(
    (entry) => entry.isShippingRequired,
  );
  const checkoutsWithShippingRequired = marketplaceCheckouts?.filter(
    (item) => item.checkout.isShippingRequired,
  );
  const checkoutForSections: Checkout = {
    ...checkout,
    email: emailProvidedForAll
      ? (checkout.email ??
        checkoutCollection.find((entry) => entry.email !== null)?.email ??
        null)
      : null,
    isShippingRequired: isShippingRequiredForAny,
    shippingAddress: shippingAddressProvidedForAll
      ? (checkout.shippingAddress ??
        checkoutCollection.find((entry) => entry.shippingAddress !== null)
          ?.shippingAddress ??
        null)
      : null,
    deliveryMethod: deliveryMethodProvidedForAll
      ? (checkout.deliveryMethod ??
        checkoutCollection.find((entry) => entry.deliveryMethod !== null)
          ?.deliveryMethod ??
        null)
      : null,
  };

  const submitDeliveryMethod = () => {
    router.push(
      paths.checkout.asPath({
        query: { step: "payment" },
      }),
    );
  };

  return (
    <Card className="overflow-hidden">
      <CheckoutUserDetailsSection
        checkout={checkoutForSections}
        isOpen={step === "user-details"}
      >
        <UserDetailsForm
          checkout={checkoutForSections}
          user={user}
          onComplete={() => {
            const nextStep = checkoutForSections.isShippingRequired
              ? "shipping-address"
              : "payment";

            router.push(
              paths.checkout.asPath({
                query: { step: nextStep },
              }),
            );
          }}
        />
      </CheckoutUserDetailsSection>

      <Separator />

      {checkoutForSections.isShippingRequired && shippingAddressSectionData && (
        <CheckoutShippingAddressSection
          checkout={checkoutForSections}
          formattedShippingAddress={
            shippingAddressSectionData.formattedShippingAddress
          }
          isOpen={step === "shipping-address"}
        >
          <ShippingAddressForm
            checkout={checkoutForSections}
            user={user}
            addresses={shippingAddressSectionData.addresses}
            countryCode={shippingAddressSectionData.countryCode}
            countries={shippingAddressSectionData.countries}
            addressFormRows={shippingAddressSectionData.addressFormRows}
          />
        </CheckoutShippingAddressSection>
      )}

      {isMarketplaceMode && checkoutsWithShippingRequired && (
        <>
          <Separator />
          <CheckoutDeliveryMethodSection
            checkout={checkoutForSections}
            isOpen={step === "delivery-method"}
            collapsedSummary={checkoutsWithShippingRequired.map(
              ({ checkout, vendorDisplayName }) => (
                <div
                  key={checkout.id}
                  className="muted-foreground flex items-center gap-1 text-sm text-muted-foreground"
                >
                  <span>{checkout.deliveryMethod?.name}</span>
                  <span>-</span>
                  <span>{vendorDisplayName}</span>
                </div>
              ),
            )}
          >
            <MarketplaceDeliveryMethodForm
              checkoutItems={checkoutsWithShippingRequired}
              onComplete={submitDeliveryMethod}
            />
          </CheckoutDeliveryMethodSection>
        </>
      )}

      {!isMarketplaceMode && checkoutForSections.isShippingRequired && (
        <>
          <Separator />
          <CheckoutDeliveryMethodSection
            checkout={checkoutForSections}
            isOpen={step === "delivery-method"}
            collapsedSummary={
              checkoutForSections.deliveryMethod ? (
                <p className="text-sm text-muted-foreground">
                  {checkoutForSections.deliveryMethod.name}
                </p>
              ) : null
            }
          >
            <DeliveryMethodForm
              checkout={checkoutForSections}
              onComplete={submitDeliveryMethod}
            />
          </CheckoutDeliveryMethodSection>
        </>
      )}

      <Separator />

      <CheckoutPaymentSection
        checkout={checkoutForSections}
        isOpen={step === "payment"}
      >
        {paymentSectionData ? (
          <Payment
            checkout={checkoutForSections}
            addressFormRows={paymentSectionData.addressFormRows}
            countries={paymentSectionData.countries}
            countryCode={paymentSectionData.countryCode}
            formattedAddresses={paymentSectionData.formattedAddresses}
            paymentGatewayCustomer={paymentSectionData.paymentGatewayCustomer}
            paymentGatewayMethods={paymentSectionData.paymentGatewayMethods}
            marketplaceCheckouts={marketplaceCheckouts}
            storeUrl={paymentSectionData.storeUrl}
            user={user}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {t.rich("errors.GENERIC_PAYMENT_ERROR", {
              link: (chunks: ReactNode) => (
                <LocalizedLink
                  href={`mailto:${clientEnvs.NEXT_PUBLIC_DEFAULT_EMAIL}`}
                  className="underline"
                  target="_blank"
                >
                  {chunks}
                </LocalizedLink>
              ),
            })}
          </p>
        )}
      </CheckoutPaymentSection>
    </Card>
  );
};
