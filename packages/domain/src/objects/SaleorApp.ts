import { z } from "zod";

export const saleorAppConfig = z.object({
  authToken: z.string(),
  saleorAppId: z.string(),
  saleorDomain: z.string(),
});

export type SaleorAppConfig = z.infer<typeof saleorAppConfig>;

// The app owns the shape of `settings`; the record around it never varies.
export type SaleorAppInstallation<Settings> = SaleorAppConfig & {
  settings: Settings | null;
};

// Every installed Saleor, keyed by domain.
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
