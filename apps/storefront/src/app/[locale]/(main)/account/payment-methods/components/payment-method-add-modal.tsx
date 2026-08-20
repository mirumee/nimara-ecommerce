"use client";

import { useTranslations } from "next-intl";
import { type ComponentProps, useEffect, useRef, useState } from "react";

import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { cn } from "@nimara/foundation/lib/cn";
import { usePathname, useRouter } from "@nimara/i18n/routing";
import { QUERY_PARAMS as PAYMENT_QUERY_PARAMS } from "@nimara/infrastructure/payment/consts";
import { Button } from "@nimara/ui/components/button";
import { Checkbox } from "@nimara/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import { Label } from "@nimara/ui/components/label";

import { SetupElement } from "@/features/payment/components/setup-element";
import { type PaymentElementHandle } from "@/features/payment/types";
import { useCurrentRegion } from "@/foundation/regions";
import { getServiceRegistry } from "@/services/registry";

import {
  paymentMethodInitializeAction,
  paymentMethodProcessAction,
} from "../actions";

type SetupElementProps = ComponentProps<typeof SetupElement>;

export const PaymentMethodAddModal = ({
  storeUrl,
  onClose,
}: {
  onClose: () => void;
  storeUrl: string;
}) => {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const region = useCurrentRegion();

  const [isDefault, setIsDefault] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<AppErrorCode[]>([]);
  const [gateway, setGateway] =
    useState<SetupElementProps["initializeData"]>(undefined);
  const [methodSession, setMethodSession] =
    useState<SetupElementProps["methodSession"]>(undefined);

  const paymentElementRef = useRef<unknown>(null);

  const isLoading = !isMounted || isProcessing;

  const handlePaymentSave = async () => {
    const paymentElement = paymentElementRef.current;

    if (!paymentElement || !gateway || !methodSession) {
      return;
    }

    setIsProcessing(true);
    setErrors([]);

    const services = await getServiceRegistry();
    const paymentService = await services.getPaymentService();

    /**
     * Carried through the provider redirect: the account page finishes the
     * tokenization from these params.
     */
    const searchParams = new URLSearchParams({
      [PAYMENT_QUERY_PARAMS.TOKENIZATION_ID]: methodSession.id,
      [PAYMENT_QUERY_PARAMS.SET_AS_DEFAULT]: isDefault.toString(),
    });
    const returnUrl = new URL(
      `${pathname}?${searchParams.toString()}`,
      storeUrl,
    );

    const resultExecute = await paymentService.methodExecute({
      initializeData: gateway,
      methodSession,
      paymentElement: paymentElement as PaymentElementHandle,
      redirectUrl: returnUrl.toString(),
    });

    if (!resultExecute.ok) {
      setErrors(resultExecute.errors.map(({ code }) => code));
      setIsProcessing(false);

      return;
    }

    const nextAction = resultExecute.data.nextAction;

    if (nextAction) {
      if (nextAction.redirectUrl) {
        window.location.assign(nextAction.redirectUrl);

        return;
      }
      throw new Error("Unhandled nextAction");
    }

    const resultProcess = await paymentMethodProcessAction({
      id: methodSession.id,
      setAsDefault: isDefault,
    });

    if (!resultProcess.ok) {
      setErrors(resultProcess.errors.map(({ code }) => code));
      setIsProcessing(false);

      return;
    }

    router.refresh();
    onClose();
  };

  useEffect(() => {
    let isCancelled = false;

    void (async () => {
      const [resultInitialize, services] = await Promise.all([
        paymentMethodInitializeAction(),
        getServiceRegistry(),
      ]);

      if (!resultInitialize.ok) {
        setErrors(resultInitialize.errors.map(({ code }) => code));

        return;
      }

      const paymentService = await services.getPaymentService();
      const resultGateway = await paymentService.gatewayInitialize({
        gatewayConfig: resultInitialize.data.gatewayConfig,
      });

      if (!resultGateway.ok) {
        setErrors(resultGateway.errors.map(({ code }) => code));

        return;
      }

      if (isCancelled) {
        return;
      }

      setGateway(resultGateway.data);
      setMethodSession(resultInitialize.data);
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className={cn("gap-6", { "pointer-events-none": !isMounted })}
      >
        <DialogHeader>
          <DialogTitle className="mb-2 text-stone-700 dark:text-stone-200">
            {t("payment.add-new-method")}
          </DialogTitle>
        </DialogHeader>

        <SetupElement
          currency={region.market.currency}
          initializeData={gateway}
          isMounted={isMounted}
          locale={region.language.locale}
          methodSession={methodSession}
          onReady={() => setIsMounted(true)}
          ref={paymentElementRef}
        />

        <Label className="flex items-center gap-2 text-sm leading-5">
          <Checkbox
            disabled={isLoading}
            checked={isDefault}
            onCheckedChange={(checked) => setIsDefault(!!checked)}
          />
          {t("payment.set-as-default")}
        </Label>

        {errors.map((code) => (
          <p key={code} className="text-sm font-medium text-destructive">
            {t(`errors.${code}`)}
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
