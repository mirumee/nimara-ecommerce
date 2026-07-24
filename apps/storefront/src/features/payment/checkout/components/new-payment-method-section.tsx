"use client";

import { useTranslations } from "next-intl";
import { type RefObject } from "react";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type Maybe } from "@nimara/domain/objects/Maybe";
import { CheckboxField } from "@nimara/foundation/form-components/checkbox-field";
import type {
  InitializeData,
  TransactionData,
} from "@nimara/infrastructure/payment/types";
import { cn } from "@nimara/ui/lib/utils";

import { PaymentElement } from "@/features/payment/components/payment-element";
import { useCurrentRegion } from "@/foundation/regions";

type NewPaymentMethodSectionProps = {
  checkout: Checkout;
  initializeData: Maybe<InitializeData>;
  isMounted: boolean;
  isProcessing: boolean;
  onReady: () => void;
  ref: RefObject<unknown>;
  showSaveForFutureUse: boolean;
  transactionData: Maybe<TransactionData>;
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
