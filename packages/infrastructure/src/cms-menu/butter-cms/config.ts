import { z } from "zod";

import { type Logger } from "#root/logging/types";

import { type ButterCMSMenuServiceConfig } from "../types";

export const butterCMSMenuEnvSchema = z.object({
  NEXT_PUBLIC_BUTTER_CMS_API_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_BUTTER_CMS_API_KEY is required for ButterCMS menus."),
});

export const toButterCMSMenuConfig = (
  env: Record<string, string | undefined>,
  logger: Logger,
): ButterCMSMenuServiceConfig => {
  const { NEXT_PUBLIC_BUTTER_CMS_API_KEY } = butterCMSMenuEnvSchema.parse(env);

  return { token: NEXT_PUBLIC_BUTTER_CMS_API_KEY, logger };
};
