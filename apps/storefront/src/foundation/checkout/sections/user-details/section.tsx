import { useTranslations } from "next-intl";
import { type PropsWithChildren } from "react";

import { type Checkout } from "@nimara/domain/objects/Checkout";

import { CheckoutSection } from "../checkout-section";

interface Props {
  checkout: Checkout;
  isOpen: boolean;
}

export const CheckoutUserDetailsSection = ({
  checkout,
  isOpen,
  children,
}: PropsWithChildren<Props>) => {
  const t = useTranslations();

  return (
    <CheckoutSection
      isComplete={checkout.email !== null}
      step="user-details"
      title={t("user-details.title")}
      isOpen={isOpen}
      collapsedSummary={
        checkout.email ? (
          <p className="text-sm text-muted-foreground">{checkout.email}</p>
        ) : null
      }
    >
      {children}
    </CheckoutSection>
  );
};
