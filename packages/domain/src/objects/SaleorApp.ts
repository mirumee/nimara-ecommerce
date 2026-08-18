/**
 * Installation record for an installed Saleor app. App-specific settings are
 * stored separately by each app.
 */
export type SaleorAppConfig = {
  authToken: string;
  saleorAppId: string;
  saleorDomain: string;
};

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
