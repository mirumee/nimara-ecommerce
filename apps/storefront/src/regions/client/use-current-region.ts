"use client";

import { useLocale } from "next-intl";

import { parseRegion } from "../utils";

export const useCurrentRegion = () => {
  const locale = useLocale();

  return parseRegion(locale);
};
