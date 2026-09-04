import { type Logger } from "@nimara/infrastructure/logging/types";

declare module "hono" {
  interface ContextVariableMap {
    logger: Logger;
    // Filled in by hono's own `requestId()`; absent when it is not mounted.
    requestId?: string;
    /**
     * Set only by `saleorTokenMiddleware` or `saleorWebhookValidationMiddleware`,
     * after verifying a signature against that installation's JWKS. Read it with
     * `requireSaleorTenant`.
     */
    saleorApiUrl?: string;
    saleorDomain?: string;
  }

  interface HonoRequest {
    // Path prefix the app is mounted under (`""` at root).
    basePath: string;
    origin: string;
  }
}
