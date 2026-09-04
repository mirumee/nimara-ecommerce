import { z } from "zod";

import { saleorConfigSchema } from "@nimara/lib/config/schema";
import { prepareConfig } from "@nimara/lib/zod/util";

import packageJson from "../../../package.json";

const configSchema = z
  .object({
    CONFIG_PROVIDER: z
      .enum(["edge", "file"])
      .default("edge")
      .describe("Where the config of every installed Saleor is stored."),
    CONFIG_KEY: z
      .string()
      .default("nimara-config")
      .describe("Config provider key."),
  })
  .and(saleorConfigSchema(packageJson));

const parsed = prepareConfig({
  name: "handler",
  schema: configSchema,
  serverOnly: true,
});

export const APP_CONFIG = {
  ...parsed,
  APP_ID: `${parsed.ENVIRONMENT}.${parsed.NAME}`,
};
