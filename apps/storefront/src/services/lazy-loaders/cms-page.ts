import { createCMSPageService } from "@nimara/infrastructure/cms-page/select";
import type { Logger } from "@nimara/infrastructure/logging/types";

import { createServiceLoader } from "@/services/integrations/create-loader";
import { resolveCMSProvider } from "@/services/integrations/resolve";

import { emptyCMSPageService } from "./empty-services";

/**
 * Creates a lazy loader for the CMS page service. The storefront only selects
 * the provider (via env) and forwards the env record — the provider catalog,
 * wiring and per-provider config contracts live in
 * `@nimara/infrastructure/cms-page/select`.
 * This function is only used by the service registry.
 * @internal
 */
export const createCMSPageServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: resolveCMSProvider,
    build: (provider, log) =>
      createCMSPageService(provider, { env: process.env, logger: log }),
    emptyService: emptyCMSPageService,
    logger,
  });
