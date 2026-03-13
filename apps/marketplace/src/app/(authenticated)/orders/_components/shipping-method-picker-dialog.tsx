"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { ScrollArea } from "@nimara/ui/components/scroll-area";

import { formatPrice } from "@/lib/utils";

import { PickerDialogShell } from "./picker-dialog-shell";

export type ShippingMethodOption = {
  active: boolean;
  id: string;
  name: string;
  price: { amount: number; currency: string };
};

export function ShippingMethodPickerDialog({
  open,
  onOpenChange,
  methods,
  selectedId,
  onPick,
}: {
  methods: ShippingMethodOption[];
  onOpenChange: (open: boolean) => void;
  onPick: (shippingMethodId: string) => void;
  open: boolean;
  selectedId?: string;
}) {
  const t = useTranslations();
  const active = useMemo(() => methods.filter((m) => m.active), [methods]);
  const [pickedId, setPickedId] = useState(selectedId ?? "");

  useEffect(() => {
    if (open) {
      setPickedId(selectedId ?? "");
    }
  }, [open, selectedId]);

  const picked = useMemo(
    () => active.find((m) => m.id === pickedId) ?? null,
    [active, pickedId],
  );

  return (
    <PickerDialogShell
      open={open}
      title={t("marketplace.orders.dialogs.shipping-method-picker.title")}
      onOpenChange={onOpenChange}
      primaryLabel={t(
        "marketplace.orders.dialogs.shipping-method-picker.assign-and-save",
      )}
      onPrimary={() => {
        if (picked) {
          onPick(picked.id);
          onOpenChange(false);
        }
      }}
      primaryDisabled={!picked}
      footerLeft={t(
        "marketplace.orders.dialogs.shipping-method-picker.methods-count",
        {
          count: active.length,
        },
      )}
    >
      <div className="rounded-md border">
        <ScrollArea className="h-[320px]">
          <div className="p-2">
            {active.length === 0 ? (
              <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                {t(
                  "marketplace.orders.dialogs.shipping-method-picker.no-shipping-methods",
                )}
              </div>
            ) : (
              active.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={[
                    "w-full rounded-md px-3 py-2 text-left text-sm",
                    "hover:bg-muted",
                    pickedId === m.id ? "bg-muted" : "",
                  ].join(" ")}
                  onClick={() => setPickedId(m.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-muted-foreground">
                      {formatPrice(m.price.amount, m.price.currency)}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </PickerDialogShell>
  );
}
