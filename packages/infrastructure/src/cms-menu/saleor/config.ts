import { z } from "zod";

import { type Logger } from "#root/logging/types";

import { type SaleorCMSMenuServiceConfig } from "../types";

export const saleorCMSMenuEnvSchema = z.object({
  NEXT_PUBLIC_SALEOR_API_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_SALEOR_API_URL is required for Saleor CMS menus."),
});

export const toSaleorCMSMenuConfig = (
  env: Record<string, string | undefined>,
  logger: Logger,
): SaleorCMSMenuServiceConfig => {
  const { NEXT_PUBLIC_SALEOR_API_URL } = saleorCMSMenuEnvSchema.parse(env);

  return { apiURL: NEXT_PUBLIC_SALEOR_API_URL, logger };
};
