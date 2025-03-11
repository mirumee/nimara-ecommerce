"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";

import { Button } from "@nimara/ui/components/button";
import { Label } from "@nimara/ui/components/label";

import { MARKETS } from "@/regions/config";
import type { MarketId, Region } from "@/regions/types";

import { ContinentRow } from "./continent-row";

export function LocaleSwitchModal({
  onClose,
  region,
}: {
  onClose: () => void;
  region: Region;
}) {
  const t = useTranslations();
  const markets = Object.values(MARKETS);
  const defaultMarket = region.market.id.toUpperCase() as Uppercase<MarketId>;
  const currentLocale = MARKETS[defaultMarket].defaultLanguage.locale;

  const marketsByContinent = {
    asia_pacific: [], // currently there are no supported countries within that continent.
    europe: markets.filter((market) => market.continent === "Europe"),
    north_america: markets.filter(
      (market) => market.continent === "North America",
    ),
  };

  return createPortal(
    <div className="pointer-events-auto absolute inset-0 z-51 flex justify-center bg-white p-4 md:py-24">
      <div className="2xl:max-w-[1536px] lg-max-w-[1024px] grow sm:max-w-[640px] md:max-w-[768px] xl:max-w-[1280px]">
        <div className="mb-4 flex justify-between">
          <Label className="text-lg font-semibold leading-7">
            {t("locale.region-settings")}
          </Label>
          <Button variant="ghost" className="px-3 py-4" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        {!!marketsByContinent.asia_pacific.length && (
          <ContinentRow
            currentLocale={currentLocale}
            name={t("locale.continents.asia-pacific")}
            markets={marketsByContinent.asia_pacific}
          />
        )}
        {!!marketsByContinent.europe.length && (
          <ContinentRow
            currentLocale={currentLocale}
            name={t("locale.continents.europe")}
            markets={marketsByContinent.europe}
          />
        )}
        {!!marketsByContinent.north_america.length && (
          <ContinentRow
            currentLocale={currentLocale}
            name={t("locale.continents.north-america")}
            markets={marketsByContinent.north_america}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}

LocaleSwitchModal.displayName = "LocaleSwitchModal";
