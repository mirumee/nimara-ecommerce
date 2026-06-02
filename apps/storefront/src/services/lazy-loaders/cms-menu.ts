import { createCMSMenuService } from "@nimara/infrastructure/cms-menu/select";
import type { Logger } from "@nimara/infrastructure/logging/types";

import { createServiceLoader } from "@/services/integrations/create-loader";
import { resolveCMSProvider } from "@/services/integrations/resolve";

import { emptyCMSMenuService } from "./empty-services";

/**
 * Creates a lazy loader for the CMS menu service. The storefront only selects
 * the provider (via env) and forwards the env record — the provider catalog,
 * wiring and per-provider config contracts live in
 * `@nimara/infrastructure/cms-menu/select`.
 * This function is only used by the service registry.
 * @internal
 */
export const createCMSMenuServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: resolveCMSProvider,
    build: (provider, log) =>
      createCMSMenuService(provider, { env: process.env, logger: log }),
    emptyService: emptyCMSMenuService,
    logger,
  });
