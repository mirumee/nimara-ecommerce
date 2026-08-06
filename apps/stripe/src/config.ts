import { z } from "zod";

import { prepareConfig } from "@/lib/zod/util";

import packageJson from "../package.json";

const EDGE_PROVIDER_KEYS = [
  "VERCEL_ACCESS_TOKEN",
  "VERCEL_TEAM_ID",
  "VERCEL_EDGE_CONFIG_ID",
] as const;

const configSchema = z
  .object({
    NAME: z.string().default(packageJson.name),
    VERSION: z.string().default(packageJson.version),
    ENVIRONMENT: z.string(),
    ALLOWED_DOMAINS: z
      .array(z.string())
      .default([])
      .describe(
        "Saleor domains allowed to install the app. Supports wildcards.",
      ),
    FETCH_TIMEOUT: z
      .number()
      .default(10000)
      .describe("Fetch timeout in milliseconds."),
    CONFIG_PROVIDER: z
      .enum(["edge", "file"])
      .default("edge")
      .describe("Where the config of every installed Saleor is stored."),
    CONFIG_FILE_PATH: z
      .string()
      .default(".saleor-app-config.json")
      .describe(
        "Config file path, relative to this app. `file` provider only.",
      ),
    VERCEL_ACCESS_TOKEN: z.string().optional().describe("Vercel access token."),
    VERCEL_TEAM_ID: z.string().optional().describe("Your Vercel Team ID."),
    VERCEL_EDGE_CONFIG_ID: z
      .string()
      .optional()
      .describe("Edge config database ID."),
    CONFIG_KEY: z
      .string()
      .describe("Config provider key.")
      .default("nimara-config"),
  })
  .superRefine((config, ctx) => {
    if (config.CONFIG_PROVIDER !== "edge") {
      return;
    }

    for (const key of EDGE_PROVIDER_KEYS) {
      if (!config[key]) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `is required when CONFIG_PROVIDER is "edge". Use CONFIG_PROVIDER=file to store the config on the local disk instead.`,
        });
      }
    }
  });

const parsed = prepareConfig({
  name: "App",
  schema: configSchema,
  input: {
    ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    ALLOWED_DOMAINS: process.env.ALLOWED_DOMAINS?.split(",")
      .map((domain) => domain.trim())
      .filter(Boolean),
  },
  serverOnly: true,
});

export const CONFIG = {
  ...parsed,
  RELEASE: `${parsed.NAME}@${parsed.VERSION}`,
  APP_ID: `${parsed.ENVIRONMENT}.${parsed.NAME}`,
};
