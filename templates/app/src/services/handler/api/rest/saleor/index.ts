import { saleorWebhookValidationMiddleware } from "@nimara/lib/hono/middleware/saleor-webhook-validation";
import { createSaleorRoutes } from "@nimara/lib/hono/saleor/routes";
import { type HandlerContext } from "@nimara/lib/hono/saleor/types";
import { type SaleorWebhook } from "@nimara/lib/saleor/webhooks";

import { ProductUpdatedSubscriptionDocument } from "@/graphql/generated/client";
import { container } from "@/services/handler/container";

import { productUpdatedHandler } from "./webhooks/product-updated";

const { appConfigService, config, installApp, joseAuthService } =
  container.items;

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
  allowedDomains: config.ALLOWED_DOMAINS,
  installApp,
  manifest: {
    appPath: "/",
    id: config.APP_ID,
    logoPath: "/logo.png",
    name: config.DISPLAY_NAME,
    permissions: ["MANAGE_PRODUCTS"],
    version: config.VERSION,
  },
  webhookMiddlewares: saleorWebhookValidationMiddleware({
    getInstallation: (saleorDomain) =>
      appConfigService.getBySaleorDomain({ saleorDomain }),
    joseAuthService,
  }),
  webhooks,
});
