"use client";

import { useTranslations } from "next-intl";
import { type ComponentProps, type RefObject } from "react";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { CheckboxField } from "@nimara/foundation/form-components/checkbox-field";
import { cn } from "@nimara/ui/lib/utils";

import { PaymentElement } from "@/features/payment/components/payment-element";
import { useCurrentRegion } from "@/foundation/regions";

type PaymentElementProps = ComponentProps<typeof PaymentElement>;

type NewPaymentMethodSectionProps = {
  checkout: Checkout;
  initializeData: PaymentElementProps["initializeData"];
  isMounted: boolean;
  isProcessing: boolean;
  onReady: () => void;
  ref: RefObject<unknown>;
  showSaveForFutureUse: boolean;
  transactionData: PaymentElementProps["transactionData"];
};

export const NewPaymentMethodSection = ({
  checkout,
  initializeData,
  isMounted,
  isProcessing,
  onReady,
  ref,
  showSaveForFutureUse,
  transactionData,
}: NewPaymentMethodSectionProps) => {
  const t = useTranslations();
  const region = useCurrentRegion();

  const fullNameSource = checkout.billingAddress ?? checkout.shippingAddress;
  const fullName = fullNameSource
    ? [fullNameSource.firstName, fullNameSource.lastName]
        .filter(Boolean)
        .join(" ") || undefined
    : undefined;

  return (
    <div className={cn({ "pointer-events-none": !isMounted })}>
      <PaymentElement
        email={checkout.email}
        fullName={fullName}
        initializeData={initializeData}
        isDisabled={isProcessing}
        isMounted={isMounted}
        locale={region.language.locale}
        onReady={onReady}
        ref={ref}
        transactionData={transactionData}
      />

      {showSaveForFutureUse && (
        <CheckboxField
          className="mt-6"
          name="saveForFutureUse"
          disabled={!isMounted || isProcessing}
          label={t("payment.save-method")}
        />
      )}
    </div>
  );
};
