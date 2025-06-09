"use client";

import { useTransition } from "react";

import { Button } from "@nimara/ui/components/button";
import { Label } from "@nimara/ui/components/label";

import { cn } from "@/lib/utils";
import type { Market, SupportedLocale } from "@/regions/types";

import { handleLocaleChange } from "./actions";

export function ContinentRow({
  currentLocale,
  markets,
  name,
}: {
  currentLocale: SupportedLocale;
  markets: Market[];
  name: string;
}) {
  const [isPending, startTransition] = useTransition();

  const onLocaleClick = (locale: SupportedLocale) => {
    startTransition(() => {
      void handleLocaleChange(locale);
    });
  };

  return (
    <>
      <Label className="border-bottom block border-b border-stone-200 py-6 text-2xl font-normal leading-8 md:py-10">
        {name}
      </Label>
      <div className="grid grid-cols-2 gap-8 py-4 md:grid-cols-4">
        {markets.map((market) => {
          const locale = market.defaultLanguage.locale;
          const isActive = locale === currentLocale;

          return (
            <div key={market.id} className="flex gap-1 px-1.5 py-2">
              <Button
                key={market.id}
                variant="ghost"
                className={cn(
                  "flex h-auto flex-col items-start p-4 text-left text-sm font-normal leading-5",
                  {
                    "pointer-events-none opacity-50": isActive,
                  },
                )}
                onClick={() => onLocaleClick(locale)}
                disabled={isPending || isActive}
              >
                <span>{market.name}</span>
                <span className="text-muted-foreground">
                  {market.defaultLanguage.name}
                </span>
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}

ContinentRow.displayName = "ContinentRow";
