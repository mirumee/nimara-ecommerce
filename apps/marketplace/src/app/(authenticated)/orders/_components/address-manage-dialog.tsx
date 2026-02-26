"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import { ScrollArea } from "@nimara/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

import { PickerDialogShell } from "./picker-dialog-shell";

export type SavedAddress = {
  city?: string | null;
  cityArea?: string | null;
  companyName?: string | null;
  country?: { code: string; country?: string | null } | null;
  countryArea?: string | null;
  firstName?: string | null;
  id: string;
  lastName?: string | null;
  phone?: string | null;
  postalCode?: string | null;
  streetAddress1?: string | null;
  streetAddress2?: string | null;
};

export type DraftAddress = {
  city: string;
  cityArea?: string;
  companyName?: string;
  countryArea?: string;
  countryCode: string;
  firstName: string;
  lastName: string;
  phone?: string;
  postalCode: string;
  streetAddress1: string;
  streetAddress2?: string;
};

function addressLabel(a: SavedAddress): string {
  const parts = [
    [a.firstName, a.lastName].filter(Boolean).join(" ").trim(),
    a.companyName,
    a.streetAddress1,
    a.streetAddress2,
    [a.postalCode, a.city].filter(Boolean).join(" "),
    a.country?.country,
  ].filter(Boolean);

  return parts.join(", ");
}

function savedAddressToDraftAddress(address: SavedAddress): DraftAddress {
  return {
    firstName: address.firstName ?? "",
    lastName: address.lastName ?? "",
    companyName: address.companyName ?? undefined,
    streetAddress1: address.streetAddress1 ?? "",
    streetAddress2: address.streetAddress2 ?? undefined,
    city: address.city ?? "",
    cityArea: address.cityArea ?? undefined,
    postalCode: address.postalCode ?? "",
    countryArea: address.countryArea ?? undefined,
    phone: address.phone ?? undefined,
    countryCode: address.country?.code ?? "",
  };
}

type Mode = "saved" | "new";

export function AddressManageDialog({
  addresses,
  countryOptions,
  initialDraftAddress,
  open,
  onOpenChange,
  onSave,
  selectedAddressId,
  title,
}: {
  addresses: SavedAddress[];
  countryOptions: Array<{ code: string; country: string }> | null | undefined;
  initialDraftAddress?: DraftAddress;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: {
    addressId?: string;
    draftAddress: DraftAddress;
    mode: Mode;
  }) => void;
  open: boolean;
  selectedAddressId?: string;
  title: string;
}) {
  const options = useMemo(
    () => (countryOptions ?? []).filter(Boolean),
    [countryOptions],
  );

  const [mode, setMode] = useState<Mode>("saved");
  const [pickedId, setPickedId] = useState(selectedAddressId ?? "");
  const [draftAddress, setDraftAddress] = useState<DraftAddress>({
    firstName: "",
    lastName: "",
    streetAddress1: "",
    city: "",
    postalCode: "",
    countryCode: "US",
  });

  const picked = useMemo(
    () => addresses.find((a) => a.id === pickedId) ?? null,
    [addresses, pickedId],
  );

  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false;

      return;
    }

    if (prevOpenRef.current) {
      return;
    }
    prevOpenRef.current = true;

    const canUseSaved = addresses.length > 0;

    setMode(canUseSaved ? "saved" : "new");
    setPickedId(selectedAddressId ?? addresses[0]?.id ?? "");

    if (canUseSaved) {
      const source =
        addresses.find((a) => a.id === (selectedAddressId ?? "")) ??
        addresses[0];

      if (source) {
        setDraftAddress(savedAddressToDraftAddress(source));
      }
    } else {
      const fallbackCountry = options[0]?.code || "US";
      const next = initialDraftAddress ?? {
        firstName: "",
        lastName: "",
        streetAddress1: "",
        city: "",
        postalCode: "",
        countryCode: fallbackCountry,
      };

      setDraftAddress({
        ...next,
        countryCode: next.countryCode || fallbackCountry,
      });
    }
  }, [addresses, initialDraftAddress, open, options, selectedAddressId]);

  const handlePickSaved = useCallback(
    (id: string) => {
      setPickedId(id);
      const addr = addresses.find((a) => a.id === id);

      if (addr) {
        setDraftAddress(savedAddressToDraftAddress(addr));
      }
    },
    [addresses],
  );

  const canSaveSaved = mode === "saved" && Boolean(picked);
  const canSaveNew =
    mode === "new" &&
    Boolean(draftAddress.firstName.trim()) &&
    Boolean(draftAddress.lastName.trim()) &&
    Boolean(draftAddress.streetAddress1.trim()) &&
    Boolean(draftAddress.city.trim()) &&
    Boolean(draftAddress.postalCode.trim()) &&
    Boolean(draftAddress.countryCode.trim());

  return (
    <PickerDialogShell
      open={open}
      title={title}
      onOpenChange={onOpenChange}
      primaryLabel="Save"
      primaryDisabled={mode === "saved" ? !canSaveSaved : !canSaveNew}
      onPrimary={() => {
        if (mode === "saved" && !picked) {
          return;
        }
        onSave({
          mode,
          addressId: mode === "saved" ? picked?.id : undefined,
          draftAddress,
        });
        onOpenChange(false);
      }}
      footerLeft=""
    >
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={mode === "saved"}
            onChange={() => setMode("saved")}
            disabled={addresses.length === 0}
          />
          Use one of customer addresses
        </label>

        {mode === "saved" ? (
          <div className="rounded-md border">
            <ScrollArea className="h-[180px]">
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
                        "w-full rounded-md border px-3 py-2 text-left text-sm",
                        "hover:bg-muted",
                        pickedId === a.id ? "border-stone-400 bg-muted" : "",
                      ].join(" ")}
                      onClick={() => handlePickSaved(a.id)}
                    >
                      {addressLabel(a)}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ) : null}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={mode === "new"}
            onChange={() => setMode("new")}
          />
          Add new address
        </label>

        {mode === "new" ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>First name</Label>
              <Input
                value={draftAddress.firstName}
                onChange={(e) =>
                  setDraftAddress((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Last name</Label>
              <Input
                value={draftAddress.lastName}
                onChange={(e) =>
                  setDraftAddress((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Street address 1</Label>
              <Input
                value={draftAddress.streetAddress1}
                onChange={(e) =>
                  setDraftAddress((prev) => ({
                    ...prev,
                    streetAddress1: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Street address 2 (optional)</Label>
              <Input
                value={draftAddress.streetAddress2 ?? ""}
                onChange={(e) =>
                  setDraftAddress((prev) => ({
                    ...prev,
                    streetAddress2: e.target.value || undefined,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Postal code</Label>
              <Input
                value={draftAddress.postalCode}
                onChange={(e) =>
                  setDraftAddress((prev) => ({
                    ...prev,
                    postalCode: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>City</Label>
              <Input
                value={draftAddress.city}
                onChange={(e) =>
                  setDraftAddress((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Phone (optional)</Label>
              <Input
                value={draftAddress.phone ?? ""}
                onChange={(e) =>
                  setDraftAddress((prev) => ({
                    ...prev,
                    phone: e.target.value || undefined,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Country</Label>
              {options.length > 0 ? (
                <Select
                  value={draftAddress.countryCode}
                  onValueChange={(code) =>
                    setDraftAddress((prev) => ({ ...prev, countryCode: code }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.country} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={draftAddress.countryCode}
                  onChange={(e) =>
                    setDraftAddress((prev) => ({
                      ...prev,
                      countryCode: e.target.value.toUpperCase(),
                    }))
                  }
                />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </PickerDialogShell>
  );
}
