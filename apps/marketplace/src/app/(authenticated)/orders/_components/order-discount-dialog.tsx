"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

import type { DiscountValueTypeEnum } from "@/graphql/generated/client";

export function OrderDiscountDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: {
    reason?: string;
    value: number;
    valueType: DiscountValueTypeEnum;
  }) => Promise<void> | void;
  open: boolean;
}) {
  const t = useTranslations();
  const [valueType, setValueType] = useState<DiscountValueTypeEnum>("FIXED");
  const [value, setValue] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setValueType("FIXED");
    setValue("");
    setReason("");
    setIsSubmitting(false);
  }, [open]);

  const parsedValue = useMemo(() => {
    const n = Number(value);

    return Number.isFinite(n) ? n : NaN;
  }, [value]);

  const canSubmit = useMemo(() => {
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      return false;
    }
    if (valueType === "PERCENTAGE" && parsedValue > 100) {
      return false;
    }

    return true;
  }, [parsedValue, valueType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("marketplace.orders.dialogs.discount.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>{t("common.type")}</Label>
            <Select
              value={valueType}
              onValueChange={(v) => setValueType(v as DiscountValueTypeEnum)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED">
                  {t("marketplace.orders.dialogs.discount.type-fixed")}
                </SelectItem>
                <SelectItem value="PERCENTAGE">
                  {t("marketplace.orders.dialogs.discount.type-percentage")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>{t("common.value")}</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                valueType === "PERCENTAGE"
                  ? t(
                      "marketplace.orders.dialogs.discount.value-placeholder-percentage",
                    )
                  : t(
                      "marketplace.orders.dialogs.discount.value-placeholder-fixed",
                    )
              }
            />
            {valueType === "PERCENTAGE" ? (
              <p className="text-xs text-muted-foreground">
                {t("marketplace.orders.dialogs.discount.value-hint")}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <Label>
              {t("marketplace.orders.dialogs.discount.reason-label")}
            </Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t(
                "marketplace.orders.dialogs.discount.reason-placeholder",
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            className="bg-stone-900 hover:bg-stone-800"
            disabled={!canSubmit || isSubmitting}
            onClick={() => {
              if (!canSubmit) {
                return;
              }
              setIsSubmitting(true);
              void Promise.resolve(
                onSubmit({
                  valueType,
                  value: parsedValue,
                  ...(reason.trim() ? { reason: reason.trim() } : {}),
                }),
              ).finally(() => setIsSubmitting(false));
            }}
          >
            {isSubmitting ? t("common.adding") : t("common.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
