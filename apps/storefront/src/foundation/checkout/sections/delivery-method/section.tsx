import { useTranslations } from "next-intl";
import { type PropsWithChildren } from "react";

import { type Checkout } from "@nimara/domain/objects/Checkout";

import { CheckoutSection } from "../checkout-section";

interface CheckoutDeliveryMethodSectionProps {
  checkout: Checkout;
  isOpen: boolean;
}

export const CheckoutDeliveryMethodSection = ({
  checkout,
  isOpen,
  children,
}: PropsWithChildren<CheckoutDeliveryMethodSectionProps>) => {
  const t = useTranslations();

  return (
    <CheckoutSection
      isComplete={checkout.deliveryMethod !== null}
      step="delivery-method"
      title={t("delivery-method.title")}
      isOpen={isOpen}
      closedContent={
        checkout.deliveryMethod ? (
          <p className="text-sm text-muted-foreground">
            {checkout.deliveryMethod.name}
          </p>
        ) : null
      }
    >
      {children}
    </CheckoutSection>
  );
};
