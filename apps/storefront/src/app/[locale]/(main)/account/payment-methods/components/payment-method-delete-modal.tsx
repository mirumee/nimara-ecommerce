"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  type PaymentMethod,
  type PaymentMethodType,
} from "@nimara/domain/objects/Payment";
import { useRouter } from "@nimara/i18n/routing";
import { type MessagePath } from "@nimara/i18n/types";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";

import { delay } from "@/features/checkout/delay";
import { renderPaymentMethod } from "@/features/checkout/payment";

import { paymentMethodDeleteAction } from "../actions";

const TYPE_MESSAGE_MAPPING: Record<PaymentMethodType, MessagePath> = {
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
          <DialogTitle className="mb-2 text-primary">
            {t("common.delete")} {t(TYPE_MESSAGE_MAPPING[type])}
          </DialogTitle>

          <DialogDescription className="text-stone-700 dark:text-muted-foreground">
            {t("account.payment-method-delete-info")}
          </DialogDescription>
        </DialogHeader>

        <p className="whitespace-pre-wrap text-sm leading-5 text-primary">
          {renderPaymentMethod({ method })}
        </p>

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
