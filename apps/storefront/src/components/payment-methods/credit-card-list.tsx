"use client";

import { useTranslations } from "next-intl";

import { type CardPaymentMethod } from "@nimara/domain/objects/Payment";

import { MethodFormItem } from "@/components/payment-methods/method-form-item";

export const CreditCardList = ({ items }: { items: CardPaymentMethod[] }) => {
  const t = useTranslations();

  return items.length ? (
    <div>
      <p className="mb-6 text-stone-500">{t("payment.credit-cards")}</p>
      <div>
        {items.map(({ id, paymentMethod }) => (
          <MethodFormItem key={id} value={id}>
            <span>
              {paymentMethod.brand.toUpperCase()} {t("payment.credit-card")} (
              {paymentMethod.last4})
            </span>
            <span>
              {t("payment.exp-date")}: {paymentMethod.expMonth}/
              {paymentMethod.expYear}
            </span>
          </MethodFormItem>
        ))}
      </div>
    </div>
  ) : null;
};
