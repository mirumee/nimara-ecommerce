import groupBy from "lodash/groupBy";
import { useTranslations } from "next-intl";

import type {
  CardPaymentMethod,
  PaymentMethod,
  PaymentMethodType,
  PaypalPaymentMethod,
} from "@nimara/domain/objects/Payment";

export type PaymentMethodMap = {
  [K in PaymentMethodType]?: Extract<PaymentMethod, { type: K }>[];
};

export const groupPaymentMethods = (methods: PaymentMethod[]) =>
  groupBy(methods, "type") as PaymentMethodMap;

export const FormattedCreditCard = ({
  brand,
  last4,
  expYear,
  expMonth,
}: CardPaymentMethod["paymentMethod"]) => {
  const t = useTranslations();

  return [
    `${brand.toUpperCase()} ${t("payment.credit-card")} (${last4})`,
    `${t("payment.exp-date")}: ${expMonth}/${expYear}`,
  ].join("\n");
};
export const FormattedPayPal = ({
  email,
}: PaypalPaymentMethod["paymentMethod"]) => {
  return email;
};

export const renderPaymentMethod = ({
  method: { type, paymentMethod },
}: {
  method: PaymentMethod;
}) => {
  if (type === "card") {
    return <FormattedCreditCard {...paymentMethod} />;
  }

  return <FormattedPayPal {...paymentMethod} />;
};
