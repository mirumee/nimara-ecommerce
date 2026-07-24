"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useTimeout } from "usehooks-ts";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { useRouter } from "@nimara/i18n/routing";
import { Spinner } from "@nimara/ui/components/spinner";

import { paths, QUERY_PARAMS } from "@/foundation/routing/paths";
import { createTrackingServiceLoader } from "@/services/lazy-loaders/tracking";

import { processPaymentAction, type ProcessPaymentResult } from "../actions";

const trackingServiceLoader = createTrackingServiceLoader();

const POLL_DELAY_MS = 750;
const TIME_EXCEEDED_MS = 30 * 1000;

export const ProcessingInfo = ({
  checkout,
  searchParams,
}: {
  checkout: Checkout;
  searchParams: Record<string, string>;
}) => {
  const t = useTranslations();
  const router = useRouter();
  const [errors, setErrors] = useState<{ code: AppErrorCode }[]>([]);
  const [isTimeExceeded, setIsTimeExceeded] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useTimeout(() => setIsTimeExceeded(true), TIME_EXCEEDED_MS);

  useEffect(() => {
    let isCancelled = false;

    const tick = async () => {
      const result: ProcessPaymentResult = await processPaymentAction({
        searchParams,
      });

      if (isCancelled) {
        return;
      }

      if ("orderId" in result) {
        const { trackPurchase } = await trackingServiceLoader();

        await trackPurchase({ checkout, orderId: result.orderId });

        router.replace(
          paths.order.confirmation.asPath({
            id: result.orderId,
            query: { [QUERY_PARAMS.orderPlaced]: "true" },
          }),
        );

        return;
      }

      if ("isProcessing" in result) {
        pollRef.current = setTimeout(tick, POLL_DELAY_MS);

        return;
      }

      setErrors(result.errors);
    };

    void tick();

    return () => {
      isCancelled = true;

      if (pollRef.current) {
        clearTimeout(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  return (
    <div className="py-32 leading-10">
      {errors.length ? (
        errors.map(({ code }, i) => <p key={i}>{t(`errors.${code}`)}</p>)
      ) : (
        <>
          <p className="text-lg">{t("payment.paymentProcessing")}...</p>
          {isTimeExceeded && (
            <p className="text-gray-500">
              {t("payment.thisTakesLongerThanUsual")}
            </p>
          )}
          <Spinner className="mx-auto mt-4" />
        </>
      )}
    </div>
  );
};
