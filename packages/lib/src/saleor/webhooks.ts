import { type SaleorAppWebhookManifest } from "@nimara/domain/objects/SaleorApp";

import { type SaleorTenant } from "#root/saleor/tenant";

// `Context` is whatever the app's HTTP layer hands a handler.
export type SaleorWebhook<Context> = {
  asyncEvents?: string[];
  handler: (
    context: Context,
    tenant: SaleorTenant,
  ) => Promise<Response> | Response;
  name: string;
  // Appended to wherever the webhook routes are mounted.
  path: `/${string}`;
  query: { toString: () => string };
  syncEvents?: string[];
};

export const webhooksManifest = <Context>({
  targetBaseUrl,
  webhooks,
}: {
  targetBaseUrl: string;
  webhooks: readonly SaleorWebhook<Context>[];
}): SaleorAppWebhookManifest[] =>
  webhooks.map(({ asyncEvents = [], name, path, query, syncEvents = [] }) => ({
    asyncEvents,
    name,
    query: query.toString(),
    syncEvents,
    targetUrl: `${targetBaseUrl}${path}`,
  }));
