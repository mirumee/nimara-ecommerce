"use client";

import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";

import { Label } from "@nimara/ui/components/label";

import { MARKETS } from "@/regions/config";
import { type MarketId, type Region } from "@/regions/types";

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
    <div
      style={{
        zIndex: 51, // 50 is max in Tailwind and it's used in topbar. I didn't wanted to changed it there to not introduce any regressions
      }}
      className="absolute inset-0 z-50 flex justify-center bg-white py-24"
    >
      {/* no idea how to represent 998px max-width in tailwind and I cannot retrieve padding values from figma, so I've moved it to styles */}
      {/* as a result I don't really know how to apply mediaquery breakpoints as it's not class-based sizing */}
      <div className="grow" style={{ maxWidth: "998px" }}>
        <div className="mb-4 flex justify-between">
          <Label className="text-lg font-semibold leading-7">
            {t("locale.region-settings")}
          </Label>
          {/* I don't know how to add a new icon  */}
          <span onClick={onClose}>X</span>
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
