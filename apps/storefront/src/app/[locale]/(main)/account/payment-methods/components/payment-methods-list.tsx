"use client";

import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  type PaymentMethod,
  type PaymentMethodType,
} from "@nimara/domain/objects/Payment";
import { Button } from "@nimara/ui/components/button";

import {
  groupPaymentMethods,
  renderPaymentMethod,
} from "@/features/checkout/payment";

const PaymentMethodDeleteModal = dynamic(
  () =>
    import("./payment-method-delete-modal").then((mod) => ({
      default: mod.PaymentMethodDeleteModal,
    })),
  {
    ssr: false,
  },
);

export const PaymentMethodsList = ({
  methods,
  customerId,
}: {
  customerId: string;
  methods: PaymentMethod[];
}) => {
  const t = useTranslations();
  const groupedMethods = groupPaymentMethods(methods);
  const [selectedMethod, setSelectedMethod] = useState<null | PaymentMethod>(
    null,
  );

  const handleDeleteModalClose = () => setSelectedMethod(null);

  const defaultMethodMessage = (
    <p className="whitespace-nowrap text-sm font-[650] leading-5 text-primary">
      {t("payment.default-method")}
    </p>
  );

  return (
    <div className="grid gap-8">
      {Object.entries(groupedMethods).map(([type, methods]) => (
        <div key={type} className="w-full">
          <p className="text-lg font-semibold leading-7 text-primary">
            {t(`payment.${type as PaymentMethodType}`)}
          </p>
          {methods.map((method) => (
            <div key={method.id} className="py-4">
              <div className="flex items-center gap-4 text-primary">
                <p className="basis-full whitespace-pre-wrap">
                  {renderPaymentMethod({ method })}
                </p>
                {method.isDefault && (
                  <div className="max-md:hidden">{defaultMethodMessage}</div>
                )}

                <Button
                  variant="outline"
                  onClick={() => setSelectedMethod(method)}
                >
                  <X className="mr-1.5 size-4" />
                  {t("common.delete")}
                </Button>
              </div>
              {method.isDefault && (
                <div className="md:hidden">{defaultMethodMessage}</div>
              )}
            </div>
          ))}
        </div>
      ))}

      {selectedMethod && (
        <PaymentMethodDeleteModal
          customerId={customerId}
          method={selectedMethod}
          onClose={handleDeleteModalClose}
        />
      )}
    </div>
  );
};
