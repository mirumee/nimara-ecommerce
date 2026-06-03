import { z } from "zod";

import { type Logger } from "#root/logging/types";

import { type SaleorSearchServiceConfig } from "./types";

export const saleorSearchEnvSchema = z.object({
  NEXT_PUBLIC_SALEOR_API_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_SALEOR_API_URL is required for Saleor search."),
});

/**
 * Default sort options. The `messageKey`s are resolved by the storefront's i18n
 * layer; infrastructure only passes them through.
 */
const DEFAULT_SORTING = [
  {
    saleorValue: { field: "NAME", direction: "ASC" },
    queryParamValue: "name-asc",
    messageKey: "search.name-asc",
  },
  {
    saleorValue: { field: "PRICE", direction: "DESC" },
    queryParamValue: "price-desc",
    messageKey: "search.price-desc",
  },
  {
    saleorValue: { field: "PRICE", direction: "ASC" },
    queryParamValue: "price-asc",
    messageKey: "search.price-asc",
  },
] as const satisfies SaleorSearchServiceConfig["settings"]["sorting"];

export const toSaleorSearchConfig = (
  env: Record<string, string | undefined>,
  logger: Logger,
): SaleorSearchServiceConfig => {
  const { NEXT_PUBLIC_SALEOR_API_URL } = saleorSearchEnvSchema.parse(env);

  return {
    apiURL: NEXT_PUBLIC_SALEOR_API_URL,
    settings: { sorting: DEFAULT_SORTING },
    logger,
  };
};
