"use client";

import { Label } from "@nimara/ui/components/label";

import { Link, localePrefixes } from "@/i18n/routing";
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
      <Label className="border-bottom block border-b border-stone-200 py-10 text-2xl font-normal leading-8">
        {name}
      </Label>

      <div className="grid grid-cols-4 gap-8 py-4">
        {markets.map((market) => (
          <Link
            style={{
              // no idea how to apply conditional styles via tailwind
              pointerEvents:
                market.defaultLanguage.locale === currentLocale
                  ? "none"
                  : "unset",
            }}
            key={market.id}
            className="flex gap-1 px-1.5 py-2 hover:cursor-pointer"
            href={
              market.defaultLanguage.locale === DEFAULT_LOCALE
                ? "."
                : localePrefixes[market.defaultLanguage.locale]
            }
          >
            <div
              // reused Button components classes, but I've not reused
              // component itself as I don't know how to remove classes
              // from it in Tailwind (h-10 and align-center)
              className="inline-flex flex-col whitespace-nowrap rounded-md px-4 py-2 text-left text-sm font-normal leading-5 ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <span>{market.name}</span>
              {/* I've found only this information in figma: Buttons/'primary' [basic]/disabled. I have no idea how to translate it to tailwind color so I've pasted the rgba value */}
              <span style={{ color: "rgba(168, 162, 158, 1)" }}>
                {market.defaultLanguage.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

ContinentRow.displayName = "ContinentRow";
