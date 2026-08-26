import { z } from "zod";

export const saleorHeaders = z.object({
  "saleor-api-url": z.url(),
  "saleor-domain": z.string(),
});

export type SaleorHeaders = z.infer<typeof saleorHeaders>;

export const saleorWebhookHeaders = z.object({
  ...saleorHeaders.shape,
  "saleor-event": z.string(),
  "saleor-signature": z.string(),
});

export type SaleorWebhookHeaders = z.infer<typeof saleorWebhookHeaders>;

export const saleorBearerHeader = z.object({
  authorization: z.string().transform((value) => value.replace("Bearer ", "")),
});

export type SaleorBearerHeader = z.infer<typeof saleorBearerHeader>;

/**
 * What a dashboard-API caller must present. The API URL is the tenant claim;
 * `saleorTokenMiddleware` is what turns it into a proven one.
 */
export const saleorTokenHeaders = z.object({
  ...saleorBearerHeader.shape,
  "saleor-api-url": saleorHeaders.shape["saleor-api-url"],
});

export type SaleorTokenHeaders = z.infer<typeof saleorTokenHeaders>;

/**
 * Saleor delivers the subscription's `event` payload as the webhook body.
 */
export type WebhookData<T extends { event: unknown } = { event: unknown }> =
  NonNullable<T["event"]>;

/**
 * Loose runtime gate — each handler declares the exact payload type; the
 * signature middleware is what authenticates it.
 */
export const webhookPayloadSchema = z.record(z.string(), z.unknown());
