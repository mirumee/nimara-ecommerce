import { z } from "zod";

import {
  type SaleorAppInstallation,
  saleorAppInstallations,
} from "@nimara/domain/objects/SaleorApp";

// Replace with your own. The pair is an example: one shown back, one not.
export const appSettings = z.object({
  publicKey: z.string(),
  secretKey: z.string(),
});

export type AppSettings = z.infer<typeof appSettings>;

// Never leave the app in full; a blank one back means keep what is stored.
export const SECRET_FIELDS = [
  "secretKey",
] as const satisfies readonly (keyof AppSettings)[];

export type AppInstallation = SaleorAppInstallation<AppSettings>;

export const saleorMultiTenantAppConfig = saleorAppInstallations(appSettings);

export type SaleorMultiTenantAppConfig = z.infer<
  typeof saleorMultiTenantAppConfig
>;

// Every service declares these, because the container they all build reads them.
export const appConfigSchema = z.object({
  CONFIG_PROVIDER: z
    .enum(["edge", "file"])
    .default("file")
    .describe("Where the config of every installed Saleor is stored."),
  CONFIG_KEY: z
    .string()
    .default("nimara-config")
    .describe("Config provider key."),
});

/**
 * What the container reads. Stated structurally rather than taken from one
 * service's config, so a service that has no siblings still satisfies it.
 */
export type AppConfig = z.infer<typeof appConfigSchema> & {
  ENVIRONMENT: string;
  FETCH_TIMEOUT: number;
  NAME: string;
};
