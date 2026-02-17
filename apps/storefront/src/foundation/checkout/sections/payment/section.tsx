"use client";

import { useTranslations } from "next-intl";
import { type PropsWithChildren } from "react";

import { type Checkout } from "@nimara/domain/objects/Checkout";

import { CheckoutSection } from "../checkout-section";

interface Props {
  checkout: Checkout;
  isOpen: boolean;
}

export const CheckoutPaymentSection = ({
  checkout,
  isOpen,
  children,
}: PropsWithChildren<Props>) => {
  const t = useTranslations();

  const isEmailProvided = checkout.email !== null;
  const isShippingProvided = checkout.isShippingRequired
    ? checkout.shippingAddress !== null
    : true;
  const isDeliveryMethodProvided = checkout.deliveryMethod !== null;

  const disabled =
    !isEmailProvided || !isShippingProvided || !isDeliveryMethodProvided;

  return (
    <CheckoutSection
      isComplete={false}
      step="payment"
      title={t("payment.title")}
      isOpen={isOpen}
      disabled={disabled}
    >
      {children}
    </CheckoutSection>
  );
};
