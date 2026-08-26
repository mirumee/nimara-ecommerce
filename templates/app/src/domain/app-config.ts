import { z } from "zod";

import {
  type SaleorAppInstallation,
  saleorAppInstallations,
} from "@nimara/domain/objects/SaleorApp";

/**
 * What this app stores for one installed Saleor — replace these fields with
 * your own. The pair is a worked example: one value the dashboard may show
 * back, one it must not.
 */
export const appSettings = z.object({
  publicKey: z.string(),
  secretKey: z.string(),
});

export type AppSettings = z.infer<typeof appSettings>;

/**
 * Fields that never leave the app in full. The dashboard renders them masked
 * and sends a blank one back when the stored value should stay, so a mask is
 * never saved over the real thing.
 */
export const SECRET_FIELDS = [
  "secretKey",
] as const satisfies readonly (keyof AppSettings)[];

export type AppInstallation = SaleorAppInstallation<AppSettings>;

export const saleorMultiTenantAppConfig = saleorAppInstallations(appSettings);

export type SaleorMultiTenantAppConfig = z.infer<
  typeof saleorMultiTenantAppConfig
>;
