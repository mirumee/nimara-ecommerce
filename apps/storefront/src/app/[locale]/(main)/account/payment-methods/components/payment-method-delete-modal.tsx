"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  type PaymentMethod,
  type PaymentMethodType,
} from "@nimara/domain/objects/Payment";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";

import { useRouter } from "@/i18n/routing";
import { delay } from "@/lib/core";
import { formatPaymentMethod } from "@/lib/payment";
import { type TranslationMessage } from "@/types";

import { paymentMethodDeleteAction } from "../actions";

const TYPE_MESSAGE_MAPPING: Record<PaymentMethodType, TranslationMessage> = {
  card: "payment.credit-card",
  paypal: "payment.paypal-account",
};

export const PaymentMethodDeleteModal = ({
  method: { type, id },
  method,
  onClose,
  customerId,
}: {
  customerId: string;
  method: PaymentMethod;
  onClose: () => void;
}) => {
  const t = useTranslations();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClose = () => {
    if (isProcessing) {
      return;
    }

    onClose();
  };

  const handleDelete = async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    const result = await paymentMethodDeleteAction({
      customerId,
      paymentMethodId: id,
    });

    if (!result.ok) {
      alert("Could not delete method");
    } else {
      router.refresh();
      await delay();
      onClose();
    }

    setIsProcessing(false);
  };

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="gap-6" withCloseButton={!isProcessing}>
        <DialogHeader>
          <DialogTitle className="mb-2 text-stone-700">
            {t("common.delete")} {t(TYPE_MESSAGE_MAPPING[type])}
          </DialogTitle>

          <DialogDescription>
            {t("account.payment-method-delete-info")}
          </DialogDescription>
        </DialogHeader>

        <p
          className="whitespace-pre-wrap text-sm leading-5 text-stone-900"
          dangerouslySetInnerHTML={{
            __html: formatPaymentMethod({ t, method }),
          }}
        />

        <div className="flex w-full justify-end gap-4">
          <Button
            onClick={handleDelete}
            disabled={isProcessing}
            loading={isProcessing}
          >
            {t("common.delete")}
          </Button>
          <Button
            disabled={isProcessing}
            variant="outline"
            onClick={handleClose}
          >
            {t("common.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
