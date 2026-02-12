"use client";

import { useTranslations } from "next-intl";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type User } from "@nimara/domain/objects/User";
import { useRouter } from "@nimara/i18n/routing";
import { Card } from "@nimara/ui/components/card";
import { Separator } from "@nimara/ui/components/separator";

import { paths } from "@/foundation/routing/paths";

import { type CheckoutStep } from "../steps";
import { CheckoutSection } from "./checkout-section";
import { ShippingAddressForm } from "./shipping-address/form";
import { CheckoutShippingAddressSection } from "./shipping-address/section";
import { type ShippingAddressSectionData } from "./shipping-address/types";
import { UserDetailsForm } from "./user-details/form";
import { CheckoutUserDetailsSection } from "./user-details/section";

interface Props {
  checkout: Checkout;
  shippingAddressSectionData: ShippingAddressSectionData | null;
  step: CheckoutStep;
  user: User | null;
}

export const CheckoutSections = ({
  step,
  checkout,
  shippingAddressSectionData,
  user,
}: Props) => {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div>
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

        <Separator />

        <CheckoutSection
          isComplete={checkout.deliveryMethod !== null}
          step="delivery-method"
          title={t("delivery-method.title")}
          isOpen={step === "delivery-method"}
        >
          <p>Delivery method</p>
        </CheckoutSection>

        <Separator />

        <CheckoutSection
          isComplete={false}
          step="payment"
          title={t("payment.title")}
          isOpen={step === "payment"}
        >
          <p>Payment</p>
        </CheckoutSection>
      </Card>
    </div>
  );
};
