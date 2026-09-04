import { type Context } from "hono";
import { type BlankEnv } from "hono/types";

import {
  type SaleorWebhookHeaders,
  type WebhookData,
} from "@nimara/infrastructure/apps/saleor/schemas";

/**
 * Hono won't infer validated types from the top middleware
 * (https://github.com/honojs/hono/issues/3202), so each handler declares its
 * subscription payload here and gets typed `req.valid("json"/"header")`.
 */
export type HandlerContext<
  WebhookEvent extends { event: unknown } = { event: unknown },
  Headers = SaleorWebhookHeaders,
> = Context<
  BlankEnv,
  "/",
  {
    in: {
      header: Headers;
      json: WebhookData<WebhookEvent>;
    };
    out: {
      header: Headers;
      json: WebhookData<WebhookEvent>;
    };
  }
>;
