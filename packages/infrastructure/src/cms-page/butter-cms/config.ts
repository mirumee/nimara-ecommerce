import { z } from "zod";

import { type Logger } from "#root/logging/types";

import { type ButterCMSPageServiceConfig } from "../types";

const envSchema = z.object({
  CMS_BUTTER_TOKEN: z
    .string()
    .min(1, "CMS_BUTTER_TOKEN is required for ButterCMS pages."),
});

export const toButterCMSPageConfig = (
  env: Record<string, string | undefined>,
  logger: Logger,
): ButterCMSPageServiceConfig => {
  const { CMS_BUTTER_TOKEN } = envSchema.parse(env);

  return { token: CMS_BUTTER_TOKEN, logger };
};
