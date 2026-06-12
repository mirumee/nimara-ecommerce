import { z } from "zod";

import { type Logger } from "#root/logging/types";

import { type ButterCMSMenuServiceConfig } from "../types";

export const butterCMSMenuEnvSchema = z.object({
  CMS_BUTTER_TOKEN: z
    .string()
    .min(1, "CMS_BUTTER_TOKEN is required for ButterCMS menus."),
});

export const toButterCMSMenuConfig = (
  env: Record<string, string | undefined>,
  logger: Logger,
): ButterCMSMenuServiceConfig => {
  const { CMS_BUTTER_TOKEN } = butterCMSMenuEnvSchema.parse(env);

  return { token: CMS_BUTTER_TOKEN, logger };
};
