"use client";

import { LockIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { Button } from "@nimara/ui/components/button";

type PlaceOrderButtonProps = {
  errors: AppErrorCode[];
  isDisabled: boolean;
  isLoading: boolean;
};

export const PlaceOrderButton = ({
  errors,
  isDisabled,
  isLoading,
}: PlaceOrderButtonProps) => {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="submit"
        disabled={isDisabled}
        className="!mt-8 flex w-full items-center gap-1.5"
        loading={isLoading}
      >
        <span className="flex items-center gap-2">
          <LockIcon size={16} />
          {t("payment.placeOrder")}
        </span>
      </Button>

      {errors.map((code, index) => (
        <p
          key={`${code}-${index}`}
          className="text-sm font-medium text-destructive"
        >
          {t(`errors.${code}`)}
        </p>
      ))}
    </div>
  );
};
