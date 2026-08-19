"use client";

import { useTranslations } from "next-intl";

import { type OtherPaymentMethod } from "@nimara/domain/objects/Payment";

import { MethodFormItem } from "./method-form-item";

export const OtherMethodList = ({ items }: { items: OtherPaymentMethod[] }) => {
  const t = useTranslations();

  return items.length ? (
    <div>
      <p className="mb-6 text-stone-500">{t("payment.other")}</p>
      <div>
        {items.map(({ id, name, token }) => (
          <MethodFormItem key={id} value={token}>
            <span>{name}</span>
          </MethodFormItem>
        ))}
      </div>
    </div>
  ) : null;
};
