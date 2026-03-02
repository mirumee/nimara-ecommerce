export interface SaleorWebhookManifest {
  asyncEvents: string[];
  name: string;
  query: string;
  syncEvents?: string[];
  targetUrl: string;
}

export interface SaleorAppManifest {
  appUrl: string;
  id: string;
  name: string;
  permissions: string[];
  tokenTargetUrl: string;
  version: string;
  webhooks: SaleorWebhookManifest[];
}
