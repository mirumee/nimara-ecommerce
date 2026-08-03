"use client";

import { type ComponentProps, type RefObject, useEffect, useRef } from "react";

import { type SupportedLocale } from "@nimara/i18n/config";
import type {
  Appearance,
  StripeElementLocale,
  StripeGateway,
  StripeMethodSessionData,
  StripePaymentElement as TStripePaymentElement,
} from "@nimara/infrastructure/payment/stripe/types";

import { PAYMENT_ELEMENT_ID } from "../../consts";

const STRIPE_LOCALE_OVERRIDES: Partial<
  Record<SupportedLocale, StripeElementLocale>
> = {
  "en-US": "en",
};

type StripeSetupElementProps = Omit<ComponentProps<"div">, "ref"> & {
  appearance?: Appearance;
  initializeData: StripeGateway;
  locale?: string;
  methodSession: StripeMethodSessionData;
  onReady?: () => void;
  ref: RefObject<unknown>;
};

/**
 * Collects a payment method to store, against the setup session the payment
 * app opened. Mirrors the payment element.
 */
export const StripeSetupElement = ({
  appearance,
  initializeData,
  locale = "auto",
  methodSession,
  onReady,
  ref,
  ...props
}: StripeSetupElementProps) => {
  const paymentElementRef = useRef<TStripePaymentElement>(null);

  useEffect(() => {
    const elements = initializeData.sdk.elements({
      appearance,
      clientSecret: methodSession.providerData.setupIntent.clientSecret,
      locale:
        STRIPE_LOCALE_OVERRIDES[locale as SupportedLocale] ??
        (locale as StripeElementLocale),
    });

    ref.current = elements;

    paymentElementRef.current = elements.create("payment", {
      layout: {
        defaultCollapsed: false,
        paymentMethodLogoPosition: "start",
        type: "accordion",
      },
    });

    paymentElementRef.current.mount(`#${PAYMENT_ELEMENT_ID}`);
    paymentElementRef.current.on("ready", onReady ?? (() => {}));

    return () => {
      paymentElementRef.current?.destroy();
      paymentElementRef.current = null;
      ref.current = null;
    };
  }, []);

  return <div {...props} id={PAYMENT_ELEMENT_ID} />;
};
