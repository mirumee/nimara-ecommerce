import { z } from "zod";

import { type Logger } from "#root/logging/types";

import { type ButterCMSPageServiceConfig } from "../types";

export const butterCMSPageEnvSchema = z.object({
  NEXT_PUBLIC_BUTTER_CMS_API_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_BUTTER_CMS_API_KEY is required for ButterCMS pages."),
});

export const toButterCMSPageConfig = (
  env: Record<string, string | undefined>,
  logger: Logger,
): ButterCMSPageServiceConfig => {
  const { NEXT_PUBLIC_BUTTER_CMS_API_KEY } = butterCMSPageEnvSchema.parse(env);

  return { token: NEXT_PUBLIC_BUTTER_CMS_API_KEY, logger };
};
