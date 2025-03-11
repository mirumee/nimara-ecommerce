"use client";

import { Button } from "@nimara/ui/components/button";
import { Label } from "@nimara/ui/components/label";

import { Link, localePrefixes } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { DEFAULT_LOCALE, type Locale, type Market } from "@/regions/types";

export function ContinentRow({
  currentLocale,
  markets,
  name,
}: {
  currentLocale: Locale;
  markets: Market[];
  name: string;
}) {
  return (
    <>
      <Label className="border-bottom block border-b border-stone-200 py-6 text-2xl font-normal leading-8 md:py-10">
        {name}
      </Label>
      <div className="grid grid-cols-2 gap-8 py-4 md:grid-cols-4">
        {markets.map((market) => (
          <Link
            className={cn("flex gap-1 px-1.5 py-2 hover:cursor-pointer", {
              "pointer-events-none opacity-50":
                market.defaultLanguage.locale === currentLocale,
            })}
            key={market.id}
            href={
              market.defaultLanguage.locale === DEFAULT_LOCALE
                ? "."
                : localePrefixes[market.defaultLanguage.locale]
            }
          >
            <Button
              variant="ghost"
              className="flex h-auto flex-col items-start p-4 text-left text-sm font-normal leading-5"
            >
              <span>{market.name}</span>
              <span className="text-muted-foreground">
                {market.defaultLanguage.name}
              </span>
            </Button>
          </Link>
        ))}
      </div>
    </>
  );
}

ContinentRow.displayName = "ContinentRow";
