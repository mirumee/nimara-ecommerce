"use client";

import { useLocale } from "next-intl";

import { createRegions } from "@nimara/foundation/regions/create-regions";

import { REGIONS_CONFIG } from "./config";

const { parseRegion } = createRegions(REGIONS_CONFIG);

export const useCurrentRegion = () => {
  const locale = useLocale();

  return Object.freeze(parseRegion(locale));
};
