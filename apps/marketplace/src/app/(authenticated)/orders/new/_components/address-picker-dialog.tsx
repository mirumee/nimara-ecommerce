"use client";

import { useEffect, useMemo, useState } from "react";

import { ScrollArea } from "@nimara/ui/components/scroll-area";

import type { CustomerByEmail } from "@/graphql/generated/client";

import { PickerDialogShell } from "./picker-dialog-shell";

type CustomerNode = NonNullable<
  NonNullable<
    NonNullable<CustomerByEmail["customers"]>["edges"][number]
  >["node"]
>;

type SavedAddress = NonNullable<CustomerNode["addresses"]>[number];

function addressLabel(a: SavedAddress): string {
  const parts = [
    a.companyName,
    a.streetAddress1,
    a.streetAddress2,
    [a.postalCode, a.city].filter(Boolean).join(" "),
    a.country?.code,
  ].filter(Boolean);

  return parts.join(", ");
}

export function AddressPickerDialog({
  open,
  onOpenChange,
  title,
  addresses,
  selectedAddressId,
  onPick,
}: {
  addresses: SavedAddress[];
  onOpenChange: (open: boolean) => void;
  onPick: (addressId: string) => void;
  open: boolean;
  selectedAddressId?: string;
  title: string;
}) {
  const [pickedId, setPickedId] = useState(selectedAddressId ?? "");

  useEffect(() => {
    if (open) {
      setPickedId(selectedAddressId ?? "");
    }
  }, [open, selectedAddressId]);

  const picked = useMemo(
    () => addresses.find((a) => a.id === pickedId) ?? null,
    [addresses, pickedId],
  );

  return (
    <PickerDialogShell
      open={open}
      title={title}
      onOpenChange={onOpenChange}
      primaryLabel="Assign and save"
      onPrimary={() => {
        if (picked) {
          onPick(picked.id);
          onOpenChange(false);
        }
      }}
      primaryDisabled={!picked}
      footerLeft={`${addresses.length} address${addresses.length === 1 ? "" : "es"}`}
    >
      <div className="rounded-md border">
        <ScrollArea className="h-[320px]">
          <div className="p-2">
            {addresses.length === 0 ? (
              <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                No saved addresses
              </div>
            ) : (
              addresses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={[
                    "w-full rounded-md px-3 py-2 text-left text-sm",
                    "hover:bg-muted",
                    pickedId === a.id ? "bg-muted" : "",
                  ].join(" ")}
                  onClick={() => setPickedId(a.id)}
                >
                  <div className="font-medium">{addressLabel(a)}</div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </PickerDialogShell>
  );
}
