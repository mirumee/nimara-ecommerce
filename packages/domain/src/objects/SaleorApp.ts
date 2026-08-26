import { z } from "zod";

/**
 * Installation record for an installed Saleor app. App-specific settings are
 * stored separately by each app.
 */
export const saleorAppConfig = z.object({
  authToken: z.string(),
  saleorAppId: z.string(),
  saleorDomain: z.string(),
});

export type SaleorAppConfig = z.infer<typeof saleorAppConfig>;

/**
 * The install record plus whatever the app itself stores for that tenant. The
 * app owns the shape of `settings`; everything around it is the same for every
 * Saleor app.
 */
export type SaleorAppInstallation<Settings> = SaleorAppConfig & {
  settings: Settings | null;
};

/**
 * Every installed Saleor, keyed by domain. The install record is the same for
 * every app; each one brings the schema of what it stores beside it.
 */
export const saleorAppInstallations = <Settings extends z.ZodType>(
  settings: Settings,
) =>
  z.record(
    z.string(),
    saleorAppConfig.extend({ settings: settings.nullable().default(null) }),
  );

export type SaleorAppWebhookManifest = {
  asyncEvents: string[];
  name: string;
  query: string;
  syncEvents: string[];
  targetUrl: string;
};

// Hand-written subset of Saleor's `Manifest` (domain stays codegen-free).
export type SaleorAppManifest = {
  about?: string;
  appUrl?: string;
  author?: string;
  brand?: {
    logo: {
      default: string;
    };
  };
  id: string;
  name: string;
  permissions: string[];
  tokenTargetUrl: string;
  version: string;
  webhooks: SaleorAppWebhookManifest[];
};
