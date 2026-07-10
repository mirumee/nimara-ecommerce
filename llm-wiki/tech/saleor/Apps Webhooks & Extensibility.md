---
type: "Technical Reference"
title: "Apps, Webhooks & Extensibility"
description: "Saleor's extensibility layer — Apps and their tokens/dashboard extensions, outbound Webhooks (async + sync), the Subscription payload model, and legacy Plugins."
tags:
  - "saleor"
  - "graphql"
  - "apps"
  - "webhooks"
  - "extensibility"
  - "reference"
resource: "/sources/saleor/schema.graphql"
saleor_version: "3.23.17"
created: "2026-07-10T00:00:00+00:00"
timestamp: "2026-07-10T00:00:00+00:00"
---

## Content

> **Saleor version:** 3.23.17 — these notes are synthesized from the archived [schema.graphql](/sources/saleor/schema.graphql) at this version. Re-synthesize them if the schema is bumped to a different Saleor version.

How Saleor is extended. `App`s (local or third-party) install integrations with auth tokens,
dashboard UI extensions, and `Webhook`s. Webhooks are **async** (fire-and-forget
notifications) or **sync** (request/response events that block and return data — these power
payment, shipping, and tax apps). `Plugin` is the legacy built-in configuration system.
(source: [schema.graphql](/sources/saleor/schema.graphql))

### Queries
- Apps: `app(id): App` · `apps(filter, sortBy, …): AppCountableConnection` ·
  `appExtension(id)` / `appExtensions(filter, …)` · `appsInstallations: [AppInstallation!]!`
- Webhooks: `webhook(id): Webhook` · `webhookEvents: [WebhookEvent!]` (deprecated) ·
  `webhookSamplePayload(eventType): JSONString`
- Plugins: `plugin(id): Plugin` · `plugins(filter, sortBy, …): PluginCountableConnection`

### Key types
- **App** (`Node & ObjectWithMetadata`) — `name`, `identifier`, `isActive`, `type: AppTypeEnum`,
  `permissions`, `tokens`, `webhooks`, `appUrl`, `manifestUrl`, `version`, `accessToken`,
  `extensions`, `brand`, `breakerState: CircuitBreakerStateEnum`, `problems`.
- **AppExtension** (`Node`) — `label`, `url`, `mountName` (String), `targetName` (String),
  `settings: JSON`, `permissions`, `app`.
- **AppToken** (`Node`) — `name`, `authToken` (last 4 chars).
- **AppInstallation** (`Node & Job`) — `status: JobStatusEnum`, `appName`, `manifestUrl`, `brand`.
- **Webhook** (`Node`) — `name`, `targetUrl`, `isActive`, `app`,
  `asyncEvents: [WebhookEventAsync!]`, `syncEvents: [WebhookEventSync!]`, `subscriptionQuery`,
  `customHeaders`, `eventDeliveries`.
- **Plugin** — `name`, `description`, `globalConfiguration`, `channelConfigurations`.

### Mutations
- App lifecycle: `appCreate/Update/Delete/Activate/Deactivate`.
- Install: `appInstall`, `appRetryInstall`, `appDeleteFailedInstallation`, `appFetchManifest`.
- Tokens: `appTokenCreate/Delete/Verify`.
- Reliability: `appReenableSyncWebhooks`, `appProblemCreate/Dismiss`.
- Webhooks: `webhookCreate/Update/Delete`, `eventDeliveryRetry`, `webhookDryRun`, `webhookTrigger`.
- Plugins: `pluginUpdate`.

### Enums
- `AppTypeEnum`: `LOCAL`, `THIRDPARTY`.
- `WebhookEventTypeAsyncEnum` — ~170+ after-the-fact events across every domain (order,
  product, checkout, customer, fulfillment, …).
- `WebhookEventTypeSyncEnum` — ~23 blocking events, e.g. payment
  (`PAYMENT_AUTHORIZE/CAPTURE/REFUND/VOID`, `TRANSACTION_*_SESSION`,
  `TRANSACTION_CHARGE_REQUESTED`), tax (`CHECKOUT_CALCULATE_TAXES`, `ORDER_CALCULATE_TAXES`),
  shipping (`SHIPPING_LIST_METHODS_FOR_CHECKOUT`, `CHECKOUT_FILTER_SHIPPING_METHODS`).
- `WebhookEventTypeEnum` — combined master list. Also `ConfigurationTypeFieldEnum`,
  `PluginConfigurationType` (`GLOBAL`, `PER_CHANNEL`), `JobStatusEnum`, `CircuitBreakerStateEnum`.

### Subscription model
`type Subscription` (with an `event` field over the `Event` interface/union) backs
**subscription-query webhooks**: a webhook's `subscriptionQuery` is a GraphQL subscription
selecting the payload shape. The `@webhookEventsInfo(asyncEvents, syncEvents)` directive
annotates which events a field/subscription triggers.

Note: this schema version exposes extension mount/target as **String** fields (`mountName`,
`targetName`), not as `AppExtensionMountEnum`/`AppExtensionTargetEnum` enums.

### Storefront relevance
Apps + sync webhooks are how Nimara integrates payment (Stripe Connect), shipping, and tax
providers without forking Saleor — the extensibility surface behind several 2026 initiatives.

## Related Notes
[Saleor GraphQL API (MOC)](/tech/saleor/Saleor%20GraphQL%20API%20%28MOC%29.md)
[Payments & Transactions](/tech/saleor/Payments%20%26%20Transactions.md)
[Shipping](/tech/saleor/Shipping.md)
[Taxes](/tech/saleor/Taxes.md)
[Accounts & Permissions](/tech/saleor/Accounts%20%26%20Permissions.md)
