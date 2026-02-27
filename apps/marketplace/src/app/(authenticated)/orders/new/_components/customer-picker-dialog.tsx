"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Input } from "@nimara/ui/components/input";
import { ScrollArea } from "@nimara/ui/components/scroll-area";

import type { CustomerByEmail } from "@/graphql/generated/client";
import { useDebounce } from "@/hooks/use-debounce";

import { searchCustomers } from "../actions";
import { PickerDialogShell } from "./picker-dialog-shell";

type CustomerNode = NonNullable<
  NonNullable<
    NonNullable<CustomerByEmail["customers"]>["edges"][number]
  >["node"]
>;

function customerLabel(c: CustomerNode): string {
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();

  return name ? `${name} <${c.email}>` : c.email;
}

export function CustomerPickerDialog({
  open,
  onOpenChange,
  initialSearch,
  selectedCustomerId,
  onPick,
}: {
  initialSearch?: string;
  onOpenChange: (open: boolean) => void;
  onPick: (customer: CustomerNode) => void;
  open: boolean;
  selectedCustomerId?: string | null;
}) {
  const [search, setSearch] = useState(initialSearch ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CustomerNode[]>([]);
  const [pickedId, setPickedId] = useState<string>(selectedCustomerId ?? "");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (open) {
      setPickedId(selectedCustomerId ?? "");
    }
  }, [open, selectedCustomerId]);

  const picked = useMemo(
    () => results.find((r) => r.id === pickedId) ?? null,
    [pickedId, results],
  );

  const handleSearch = async (rawSearch?: string) => {
    const q = (rawSearch ?? search).trim();

    if (!q) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await searchCustomers(q);

      if (!res.ok) {
        setResults([]);
        return;
      }
      const nodes =
        res.data.customers?.edges?.map((e) => e.node).filter(Boolean) ?? [];

      setResults(nodes);
      if (!pickedId && nodes[0]?.id) {
        setPickedId(nodes[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !debouncedSearch.trim()) return;

    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      const res = await searchCustomers(debouncedSearch.trim());
      if (cancelled) return;
      if (!res.ok) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      const nodes =
        res.data.customers?.edges?.map((e) => e.node).filter(Boolean) ?? [];
      setResults(nodes);
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, open]);

  return (
    <PickerDialogShell
      open={open}
      title="Select customer"
      onOpenChange={onOpenChange}
      primaryLabel="Assign and save"
      onPrimary={() => {
        if (picked) {
          onPick(picked);
          onOpenChange(false);
        }
      }}
      primaryDisabled={!picked}
      footerLeft={
        results.length > 0
          ? `${results.length} result${results.length === 1 ? "" : "s"}`
          : ""
      }
    >
      <div className="grid gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleSearch();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleSearch()}
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="rounded-md border">
          <ScrollArea className="h-[320px]">
            <div className="p-2">
              {results.length === 0 ? (
                <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                  No results
                </div>
              ) : (
                results.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={[
                      "w-full rounded-md px-3 py-2 text-left text-sm",
                      "hover:bg-muted",
                      pickedId === c.id ? "bg-muted" : "",
                    ].join(" ")}
                    onClick={() => setPickedId(c.id)}
                  >
                    <div className="font-medium">{customerLabel(c)}</div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </PickerDialogShell>
  );
}
