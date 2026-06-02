import { z } from "zod";

import { type Logger } from "#root/logging/types";

import { type SaleorCMSPageServiceConfig } from "../types";

const envSchema = z.object({
  NEXT_PUBLIC_SALEOR_API_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_SALEOR_API_URL is required for Saleor CMS pages."),
});

export const toSaleorCMSPageConfig = (
  env: Record<string, string | undefined>,
  logger: Logger,
): SaleorCMSPageServiceConfig => {
  const { NEXT_PUBLIC_SALEOR_API_URL } = envSchema.parse(env);

  return { apiURL: NEXT_PUBLIC_SALEOR_API_URL, logger };
};
