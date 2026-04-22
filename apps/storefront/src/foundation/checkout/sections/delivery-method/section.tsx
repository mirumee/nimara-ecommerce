import { useTranslations } from "next-intl";
import { type PropsWithChildren, type ReactNode } from "react";

import { type Checkout } from "@nimara/domain/objects/Checkout";

import { CheckoutSection } from "../checkout-section";

interface CheckoutDeliveryMethodSectionProps {
  checkout: Checkout;
  collapsedSummary?: ReactNode;
  isOpen: boolean;
}

export const CheckoutDeliveryMethodSection = ({
  checkout,
  isOpen,
  children,
  collapsedSummary,
}: PropsWithChildren<CheckoutDeliveryMethodSectionProps>) => {
  const t = useTranslations();

  const isDeliveryMethodProvided = checkout.deliveryMethod !== null;
  const disabled = !isDeliveryMethodProvided;

  const defaultSummary = checkout.deliveryMethod ? (
    <p className="text-sm text-muted-foreground">
      {checkout.deliveryMethod.name}
    </p>
  ) : null;

  return (
    <CheckoutSection
      isComplete={checkout.deliveryMethod !== null}
      step="delivery-method"
      title={t("delivery-method.title")}
      isOpen={isOpen}
      disabled={disabled}
      collapsedSummary={collapsedSummary ?? defaultSummary}
    >
      {children}
    </CheckoutSection>
  );
};
