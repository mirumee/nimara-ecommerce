import { useTranslations } from "next-intl";

import { type PaypalPaymentMethod } from "@nimara/domain/objects/Payment";

import { MethodFormItem } from "@/components/payment-methods/method-form-item";

export const PaypalList = ({ items }: { items: PaypalPaymentMethod[] }) => {
  const t = useTranslations();

  return items.length ? (
    <div>
      <p className="mb-6 text-stone-500">{t("payment.paypal-accounts")}</p>
      <div>
        {items.map(({ id, paymentMethod }) => (
          <MethodFormItem key={id} value={id}>
            <span>{paymentMethod.email}</span>
          </MethodFormItem>
        ))}
      </div>
    </div>
  ) : null;
};
