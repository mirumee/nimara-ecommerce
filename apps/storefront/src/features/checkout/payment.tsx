import groupBy from "lodash/groupBy";
import type { ReactNode } from "react";

import { type BaseError } from "@nimara/domain/objects/Error";
import type {
  CardPaymentMethod,
  PaymentMethod,
  PaymentMethodType,
  PaypalPaymentMethod,
} from "@nimara/domain/objects/Payment";

import { clientEnvs } from "@/envs/client";
import { LocalizedLink } from "@/i18n/routing";
import { translateOrFallback } from "@nimara/foundation/i18n/helpers/translate-or-fallback";
import type { GetTranslations } from "@nimara/foundation/i18n/types";

export type PaymentMethodMap = {
  [K in PaymentMethodType]?: Extract<PaymentMethod, { type: K }>[];
};

export const groupPaymentMethods = (methods: PaymentMethod[]) =>
  groupBy(methods, "type") as PaymentMethodMap;

export const formatCreditCard = (
  t: GetTranslations,
  { brand, last4, expYear, expMonth }: CardPaymentMethod["paymentMethod"],
) =>
  [
    `${brand.toUpperCase()} ${t("payment.credit-card")} (${last4})`,
    `${t("payment.exp-date")}: ${expMonth}/${expYear}`,
  ].join("\n");

export const formatPayPal = (
  _: GetTranslations,
  { email }: PaypalPaymentMethod["paymentMethod"],
) => email;

const FORMATTERS = {
  card: formatCreditCard,
  paypal: formatPayPal,
} as const;

export const formatPaymentMethod = ({
  t,
  method: { type, paymentMethod },
}: {
  method: PaymentMethod;
  t: GetTranslations;
}) => {
  if (type === "card") {
    return FORMATTERS.card(t, paymentMethod as CardPaymentMethod["paymentMethod"]);
  }
  return FORMATTERS.paypal(t, paymentMethod as PaypalPaymentMethod["paymentMethod"]);
};

const DEFAULT_ERROR_CODES = [
  "errors.stripe.payment_intent_authentication_failure",
];

export const translateApiErrors = ({
  errors,
  t,
}: {
  errors: BaseError[];
  t: GetTranslations;
}) => {
  const defaultErrorMessage = t.rich("errors.GENERIC_PAYMENT_ERROR", {
    link: (chunks) => (
      <LocalizedLink
        href={`mailto:${clientEnvs.NEXT_PUBLIC_DEFAULT_EMAIL}`}
        className="underline"
        target="_blank"
      >
        {chunks}
      </LocalizedLink>
    ),
  }) as ReactNode;

  return errors.map(({ code }) => {
    const path = ["errors", code].filter(Boolean).join(".");

    /**
     * Some messages should be presented as a default error. To avoid missing message errors
     * return the default message immediately.
     */
    if (DEFAULT_ERROR_CODES.includes(path)) {
      return defaultErrorMessage;
    }

    return translateOrFallback({
      t,
      path,
      fallback: defaultErrorMessage,
    });
  });
};
