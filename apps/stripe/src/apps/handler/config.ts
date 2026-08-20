import { z } from "zod";

import { baseConfigSchema } from "@/lib/config/schema";
import { prepareConfig } from "@/lib/zod/util";

const configSchema = z
  .object({
    ALLOWED_DOMAINS: z
      .array(z.string())
      .default([])
      .describe(
        "Saleor domains allowed to install the app. Supports wildcards.",
      ),
    CONFIG_PROVIDER: z
      .enum(["edge", "file"])
      .default("edge")
      .describe("Where the config of every installed Saleor is stored."),
    CONFIG_KEY: z
      .string()
      .default("nimara-config")
      .describe("Config provider key."),
    DEFAULT_CHANNEL_SLUG: z
      .string()
      .min(1)
      .default("default-channel")
      .describe(
        "Channel the config UI collects the config on; others inherit.",
      ),
  })
  .and(baseConfigSchema);

const parsed = prepareConfig({
  name: "handler",
  schema: configSchema,
  input: {
    ALLOWED_DOMAINS: process.env.ALLOWED_DOMAINS?.split(",")
      .map((domain) => domain.trim())
      .filter(Boolean),
  },
  serverOnly: true,
});

export const APP_CONFIG = {
  ...parsed,
  RELEASE: `${parsed.NAME}@${parsed.VERSION}`,
  APP_ID: `${parsed.ENVIRONMENT}.${parsed.NAME}`,
};
