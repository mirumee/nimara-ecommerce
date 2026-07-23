"use client";

import { type ComponentProps, type RefObject, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";

import { type Maybe } from "@nimara/domain/objects/Maybe";
import type {
  Appearance,
  InitializeData,
  StripeElementLocale,
  StripePaymentElement as TStripePaymentElement,
  TransactionData,
} from "@nimara/infrastructure/payment/stripe/types";
import { cn } from "@nimara/ui/lib/utils";

import { PAYMENT_ELEMENT_ID } from "../../consts";

const STRIPE_LOCALE_OVERRIDES: Record<string, string> = {
  "en-US": "en",
};

type StripePaymentElementProps = Omit<ComponentProps<"div">, "ref"> & {
  appearance?: Appearance;
  email: Maybe<string>;
  fullName?: string;
  initializeData: InitializeData;
  isDisabled?: boolean;
  locale?: string;
  onReady?: () => void;
  ref: RefObject<unknown>;
  transactionData: TransactionData;
};

export const StripePaymentElement = ({
  appearance,
  email,
  fullName,
  initializeData,
  isDisabled,
  locale = "auto",
  onReady,
  ref,
  transactionData,
  ...props
}: StripePaymentElementProps) => {
  const { clearErrors, setValue } = useFormContext();
  const paymentElementRef = useRef<TStripePaymentElement>(null);

  useEffect(() => {
    const elements = initializeData.sdk.elements({
      appearance,
      clientSecret: transactionData.clientSecret,
      locale: (STRIPE_LOCALE_OVERRIDES[locale] ??
        locale) as StripeElementLocale,
    });

    ref.current = elements;

    paymentElementRef.current = elements.create("payment", {
      defaultValues: {
        billingDetails: {
          email: email ?? undefined,
          name: fullName,
        },
      },
      fields: {
        billingDetails: {
          address: {
            country: "never",
          },
        },
      },
      layout: {
        defaultCollapsed: false,
        paymentMethodLogoPosition: "start",
        type: "accordion",
      },
    });

    paymentElementRef.current.mount(`#${PAYMENT_ELEMENT_ID}`);
    paymentElementRef.current
      .on("ready", onReady ?? (() => {}))
      .on("change", ({ collapsed, complete, value }) => {
        if (!collapsed) {
          setValue("paymentMethod", complete ? value.type : null);

          if (complete) {
            clearErrors("paymentMethod");
          }
        }
      });

    return () => {
      paymentElementRef.current?.destroy();
      paymentElementRef.current = null;
      ref.current = null;
    };
  }, []);

  useEffect(() => {
    if (paymentElementRef.current) {
      paymentElementRef.current.update({ readOnly: isDisabled });
    }
  }, [isDisabled]);

  return (
    <div
      className={cn({ "pointer-events-none opacity-50": isDisabled })}
      {...props}
      id={PAYMENT_ELEMENT_ID}
    />
  );
};
