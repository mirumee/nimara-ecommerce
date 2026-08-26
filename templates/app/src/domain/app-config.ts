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
