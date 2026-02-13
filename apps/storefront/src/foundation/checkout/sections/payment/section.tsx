import { useTranslations } from "next-intl";
import { type PropsWithChildren } from "react";

import { type Checkout } from "@nimara/domain/objects/Checkout";

import { CheckoutSection } from "../checkout-section";

interface Props {
  checkout: Checkout;
  isOpen: boolean;
}

export const CheckoutPaymentSection = ({
  checkout: _checkout,
  isOpen,
  children,
}: PropsWithChildren<Props>) => {
  const t = useTranslations();

  return (
    <CheckoutSection
      isComplete={false}
      step="payment"
      title={t("payment.title")}
      isOpen={isOpen}
      closedContent={
        <p className="text-sm text-muted-foreground">{t("payment.title")}</p>
      }
    >
      {children}
    </CheckoutSection>
  );
};
