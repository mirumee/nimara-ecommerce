"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useInterval } from "usehooks-ts";

import { Spinner } from "@nimara/ui/components/spinner";

import { useRouter } from "@/i18n/routing";
import type { TranslationMessage } from "@/types";

export const ProcessingInfo = ({
  errors,
}: {
  errors: { code: string; type: string }[];
}) => {
  const [isTimeExceeded, setIsTimeExceeded] = useState(false);
  const t = useTranslations();
  const router = useRouter();

  useInterval(() => {
    setIsTimeExceeded(true);
  }, 30 * 1000);

  useInterval(() => {
    router.refresh();
  }, 3500);

  return (
    <div className="py-32 leading-10">
      {errors.length ? (
        errors.map(({ code, type }, i) => (
          <p key={i}>{t(`errors.${type}.${code}` as TranslationMessage)}</p>
        ))
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
