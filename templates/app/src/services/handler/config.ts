import { z } from "zod";

import { prepareServiceConfig } from "@nimara/lib/config/service";

import packageJson from "../../../package.json";

const parsed = prepareServiceConfig({
  moduleUrl: import.meta.url,
  pkg: packageJson,
  schema: z.object({
    CONFIG_PROVIDER: z
      .enum(["edge", "file"])
      .default("file")
      .describe("Where the config of every installed Saleor is stored."),
    CONFIG_KEY: z
      .string()
      .default("nimara-config")
      .describe("Config provider key."),
  }),
});

export const APP_CONFIG = {
  ...parsed,
  APP_ID: `${parsed.ENVIRONMENT}.${parsed.NAME}`,
};
