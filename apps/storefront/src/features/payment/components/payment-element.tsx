"use client";

import { useTheme } from "next-themes";
import { type RefObject } from "react";

import { type Maybe } from "@nimara/domain/objects/Maybe";
import type {
  InitializeData,
  TransactionData,
} from "@nimara/infrastructure/payment/types";
import { Spinner } from "@nimara/ui/components/spinner";
import { cn } from "@nimara/ui/lib/utils";

import { StripePaymentElement } from "@/features/payment/providers/stripe/stripe-payment-element";

type PaymentElementProps = {
  email: Maybe<string>;
  fullName?: string;
  initializeData: Maybe<InitializeData>;
  isDisabled: boolean;
  isMounted: boolean;
  locale: string;
  onReady: () => void;
  ref: RefObject<unknown>;
  transactionData: Maybe<TransactionData>;
};

/**
 * Renders a spinner until the payment data is ready and the payment element
 * has mounted, then the provider payment element itself.
 */
export const PaymentElement = ({
  email,
  fullName,
  initializeData,
  isDisabled,
  isMounted,
  locale,
  onReady,
  ref,
  transactionData,
}: PaymentElementProps) => {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const spinner = <Spinner className="mx-auto my-16 block" />;

  if (!initializeData || !transactionData) {
    return spinner;
  }

  return (
    <>
      {!isMounted && spinner}
      <StripePaymentElement
        key={`${transactionData.clientSecret}-${resolvedTheme}`}
        appearance={{
          theme: isDark ? "night" : "flat",
          variables: {
            borderRadius: "5px",
          },
        }}
        className={cn({ hidden: !isMounted })}
        email={email}
        fullName={fullName}
        initializeData={initializeData}
        isDisabled={isDisabled}
        locale={locale}
        onReady={onReady}
        ref={ref}
        transactionData={transactionData}
      />
    </>
  );
};
