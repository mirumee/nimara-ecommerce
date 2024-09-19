import { type DateTimeFormatOptions } from "next-intl";

import { type CountryCode } from "@nimara/codegen/schema";

import { type WithRegion } from "@/lib/types";

export const localizedFormatter = ({ region }: WithRegion) => ({
  price: (
    opts: Omit<Parameters<typeof formatAsPrice>[0], "locale" | "currency"> & {
      currency?: string;
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
  minimumFractionDigits = 0,
}: {
  amount: number;
  currency: string;
  locale: string;
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
  country: CountryCode;
  locale: string;
}) => new Intl.DisplayNames(locale, { type: "region" }).of(country) as string;

export const formatAsDate = ({
  locale,
  date,
  options = { month: "long", year: "numeric", day: "2-digit" },
}: {
  date: string;
  locale: string;
  options?: DateTimeFormatOptions;
}) => new Intl.DateTimeFormat(locale, options).format(new Date(date));
