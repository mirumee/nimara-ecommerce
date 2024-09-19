"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import { Label } from "@nimara/ui/components/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

import { MARKETS } from "@/regions/config";
import type { MarketId, Region } from "@/regions/types";

import { handleLocaleFormSubmit } from "./actions";

export function LocaleSwitchModal({ region }: { region: Region }) {
  const t = useTranslations();
  const markets = Object.values(MARKETS);
  const defaultMarket = region.market.id.toUpperCase() as Uppercase<MarketId>;
  const [currentRegion, setCurrentRegion] = useState<(typeof markets)[number]>(
    MARKETS[defaultMarket],
  );
  const currentLocale = currentRegion.defaultLanguage.locale;

  return (
    <DialogContent className="bg-white sm:max-w-[425px]">
      <form action={handleLocaleFormSubmit}>
        <DialogHeader>
          <DialogTitle>{t("locale.region-settings")}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Label>{t("locale.region")}</Label>
          <Select
            defaultValue={defaultMarket.toUpperCase()}
            onValueChange={(value: Uppercase<MarketId>) =>
              setCurrentRegion(MARKETS[value])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="market" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {markets.map((market) => (
                  <SelectItem key={market.id} value={market.id.toUpperCase()}>
                    {market.name} ({market.currency})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Label>{t("locale.language")}</Label>
          <Select name="locale" value={currentLocale}>
            <SelectTrigger>
              <SelectValue placeholder="lang" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {currentRegion.supportedLanguages.map((language) => (
                  <SelectItem key={language.id} value={language.locale}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <div className="flex w-full items-center justify-between">
            <DialogClose asChild>
              <Button variant="ghost">{t("common.close")}</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit">{t("common.save")}</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

LocaleSwitchModal.displayName = "LocaleSwitchModal";
