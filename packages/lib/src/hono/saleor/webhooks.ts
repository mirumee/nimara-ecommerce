import { Hono, type MiddlewareHandler } from "hono";

import { withSaleorTenant } from "#root/hono/saleor/tenant";
import { type HandlerContext } from "#root/hono/saleor/types";
import { type SaleorWebhook } from "#root/saleor/webhooks";

export const createWebhookRoutes = ({
  middlewares = [],
  webhooks,
}: {
  middlewares?: MiddlewareHandler[];
  webhooks: readonly SaleorWebhook<HandlerContext<any>>[];
}) => {
  const routes = new Hono();

  if (middlewares.length) {
    routes.use("*", ...middlewares);
  }

  webhooks.forEach(({ handler, path }) =>
    routes.post(path, withSaleorTenant(handler)),
  );

  return routes;
};
