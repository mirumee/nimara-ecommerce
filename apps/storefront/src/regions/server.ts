"use server";

import { getLocale } from "next-intl/server";

import type { Region } from "@/regions/types";

import { parseRegion } from "./utils";

export const getCurrentRegion = async (): Promise<Readonly<Region>> => {
  const locale = await getLocale();

  return parseRegion(locale);
};
