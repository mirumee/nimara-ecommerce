import { type DateTimeFormatOptions } from "next-intl";

import { type AllCountryCode } from "@nimara/domain/consts";

import { type WithRegion } from "@/lib/types";
import { type SupportedCurrency, type SupportedLocale } from "@/regions/types";

export const localizedFormatter = ({ region }: WithRegion) => ({
  price: (
    opts: Omit<Parameters<typeof formatAsPrice>[0], "locale" | "currency"> & {
      currency?: SupportedCurrency;
    },
  ) =>
    formatAsPrice({
      locale: region.language.locale,
      currency: region.market.currency,
      ...opts,
    }),
  country: (opts: Omit<Parameters<typeof formatAsCountry>[0], "locale">) =>
    formatAsCountry({ locale: region.language.locale, ...opts }),
  date: (opts: Omit<Parameters<typeof formatAsDate>[0], "locale">) =>
    formatAsDate({ locale: region.language.locale, ...opts }),
});

export const formatAsPrice = ({
  locale,
  amount,
  currency,
  minimumFractionDigits = 2,
}: {
  amount: number;
  currency: SupportedCurrency;
  locale: SupportedLocale;
  minimumFractionDigits?: number;
}) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits,
    currency,
  }).format(amount);

export const formatAsCountry = ({
  locale,
  country,
}: {
  country: AllCountryCode;
  locale: SupportedLocale;
}) => new Intl.DisplayNames(locale, { type: "region" }).of(country) as string;

export const formatAsDate = ({
  locale,
  date,
  options = { month: "long", year: "numeric", day: "2-digit" },
}: {
  date: string;
  locale: SupportedLocale;
  options?: DateTimeFormatOptions;
}) => new Intl.DateTimeFormat(locale, options).format(new Date(date));
