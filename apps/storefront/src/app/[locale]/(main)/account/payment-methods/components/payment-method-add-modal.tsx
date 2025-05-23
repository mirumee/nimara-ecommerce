"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Checkbox } from "@nimara/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import { Label } from "@nimara/ui/components/label";
import { Spinner } from "@nimara/ui/components/spinner";

import { usePathname } from "@/i18n/routing";
import { PAYMENT_ELEMENT_ID } from "@/lib/consts";
import { translateApiErrors } from "@/lib/payment";
import { cn } from "@/lib/utils";
import { useCurrentRegion } from "@/regions/client";
import { paymentService } from "@/services/payment";

export const PaymentMethodAddModal = ({
  secret,
  storeUrl,
  onClose,
}: {
  onClose: () => void;
  secret: string;
  storeUrl: string;
}) => {
  const t = useTranslations();
  const pathname = usePathname();
  const region = useCurrentRegion();

  const redirectUrl = `${storeUrl}${pathname}`;

  const [isDefault, setIsDefault] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<(string | ReactNode)[]>([]);

  const isLoading = !isMounted || isProcessing;

  const handlePaymentSave = async () => {
    setIsProcessing(true);

    const result = await paymentService.paymentMethodSaveExecute({
      redirectUrl,
      saveForFutureUse: isDefault,
    });

    if (!result.ok) {
      setErrors(translateApiErrors({ t, errors: result.errors }));
    }

    setIsProcessing(false);
  };

  useEffect(() => {
    void (async () => {
      await paymentService.paymentInitialize();

      const { mount } = await paymentService.paymentElementCreate({
        locale: region.language.locale,
        secret,
      });

      mount(`#${PAYMENT_ELEMENT_ID}`);

      setIsMounted(true);
    })();
  }, []);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className={cn("gap-6", { "pointer-events-none": !isMounted })}
      >
        <DialogHeader>
          <DialogTitle className="mb-2 text-stone-700">
            {t("payment.add-new-method")}
          </DialogTitle>
        </DialogHeader>

        {!isMounted && (
          <div className={cn("flex w-full justify-center py-16")}>
            <Spinner />
          </div>
        )}

        <div id={PAYMENT_ELEMENT_ID} className={cn({ hidden: !isMounted })} />

        <Label className="flex items-center gap-2 text-sm leading-5">
          <Checkbox
            disabled={isLoading}
            checked={isDefault}
            onCheckedChange={(checked) => setIsDefault(!!checked)}
          />
          {t("payment.set-as-default")}
        </Label>

        {errors.map((message, i) => (
          <p key={i} className="text-destructive text-sm font-medium">
            {message}
          </p>
        ))}

        <div className="flex w-full justify-end gap-4">
          <Button disabled={isLoading} variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button disabled={isLoading} onClick={handlePaymentSave}>
            {t("payment.save-new-method")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
