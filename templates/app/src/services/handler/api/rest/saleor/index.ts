import { saleorWebhookValidationMiddleware } from "@nimara/lib/hono/middleware/saleor-webhook-validation";
import { createSaleorRoutes } from "@nimara/lib/hono/saleor/routes";
import { type HandlerContext } from "@nimara/lib/hono/saleor/types";
import { type SaleorWebhook } from "@nimara/lib/saleor/webhooks";

import { container } from "@/container";
import { ProductUpdatedSubscriptionDocument } from "@/graphql/generated/client";

import { productUpdatedHandler } from "./webhooks/product-updated";

const CONFIG = container.get("config");

const webhooks: SaleorWebhook<HandlerContext<any>>[] = [
  {
    asyncEvents: ["PRODUCT_UPDATED"],
    handler: productUpdatedHandler,
    name: "ProductUpdated",
    path: "/product-updated",
    query: ProductUpdatedSubscriptionDocument,
  },
];

export const saleorRoutes = createSaleorRoutes({
  allowedDomains: CONFIG.ALLOWED_DOMAINS,
  installApp: container.get("installApp"),
  manifest: {
    appPath: "/",
    id: CONFIG.APP_ID,
    name: CONFIG.DISPLAY_NAME,
    permissions: ["MANAGE_PRODUCTS"],
    version: CONFIG.VERSION,
  },
  webhookMiddlewares: saleorWebhookValidationMiddleware({
    getInstallation: (saleorDomain) =>
      container.get("appConfigService").getBySaleorDomain({ saleorDomain }),
    joseAuthService: container.get("joseAuthService"),
  }),
  webhooks,
});
