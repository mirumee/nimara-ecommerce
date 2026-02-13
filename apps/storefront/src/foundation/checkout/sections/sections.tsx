"use client";

import { useTranslations } from "next-intl";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type User } from "@nimara/domain/objects/User";
import { useRouter } from "@nimara/i18n/routing";
import { Card } from "@nimara/ui/components/card";
import { Separator } from "@nimara/ui/components/separator";

import { PaymentForm } from "@/foundation/checkout/sections/payment/form";
import { CheckoutPaymentSection } from "@/foundation/checkout/sections/payment/section";
import { paths } from "@/foundation/routing/paths";

import { type CheckoutStep } from "../steps";
import { DeliveryMethodForm } from "./delivery-method/form";
import { CheckoutDeliveryMethodSection } from "./delivery-method/section";
import { type PaymentSectionData } from "./payment/types";
import { ShippingAddressForm } from "./shipping-address/form";
import { CheckoutShippingAddressSection } from "./shipping-address/section";
import { type ShippingAddressSectionData } from "./shipping-address/types";
import { UserDetailsForm } from "./user-details/form";
import { CheckoutUserDetailsSection } from "./user-details/section";

interface Props {
  checkout: Checkout;
  paymentSectionData: PaymentSectionData | null;
  shippingAddressSectionData: ShippingAddressSectionData | null;
  step: CheckoutStep;
  user: User | null;
}

export const CheckoutSections = ({
  step,
  checkout,
  paymentSectionData,
  shippingAddressSectionData,
  user,
}: Props) => {
  const t = useTranslations();
  const router = useRouter();

  return (
    <Card className="overflow-hidden">
      <CheckoutUserDetailsSection
        checkout={checkout}
        isOpen={step === "user-details"}
      >
        <UserDetailsForm
          checkout={checkout}
          user={user}
          onComplete={() => {
            const nextStep = checkout.isShippingRequired
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

      {checkout.isShippingRequired && shippingAddressSectionData && (
        <CheckoutShippingAddressSection
          checkout={checkout}
          formattedShippingAddress={
            shippingAddressSectionData.formattedShippingAddress
          }
          isOpen={step === "shipping-address"}
        >
          <ShippingAddressForm
            checkout={checkout}
            user={user}
            addresses={shippingAddressSectionData.addresses}
            countryCode={shippingAddressSectionData.countryCode}
            countries={shippingAddressSectionData.countries}
            addressFormRows={shippingAddressSectionData.addressFormRows}
          />
        </CheckoutShippingAddressSection>
      )}

      {checkout.isShippingRequired && (
        <>
          <Separator />
          <CheckoutDeliveryMethodSection
            checkout={checkout}
            isOpen={step === "delivery-method"}
          >
            <DeliveryMethodForm
              checkout={checkout}
              onComplete={() => {
                router.push(
                  paths.checkout.asPath({
                    query: { step: "payment" },
                  }),
                );
              }}
            />
          </CheckoutDeliveryMethodSection>
        </>
      )}

      <Separator />

      <CheckoutPaymentSection checkout={checkout} isOpen={step === "payment"}>
        {paymentSectionData ? (
          <PaymentForm
            checkout={checkout}
            paymentSectionData={paymentSectionData}
            user={user}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("errors.GENERIC_PAYMENT_ERROR")}
          </p>
        )}
      </CheckoutPaymentSection>
    </Card>
  );
};
