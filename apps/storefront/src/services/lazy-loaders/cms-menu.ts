import { createCMSMenuService } from "@nimara/infrastructure/cms-menu/select";
import type { Logger } from "@nimara/infrastructure/logging/types";

import { buildCMSMenuConfig } from "@/services/integrations/cms-menu";
import { createServiceLoader } from "@/services/integrations/create-loader";
import { resolveCMSProvider } from "@/services/integrations/resolve";

import { emptyCMSMenuService } from "./empty-services";

/**
 * Creates a lazy loader for the CMS menu service. The storefront only selects
 * the provider (via env) and supplies its config — the provider catalog and
 * wiring live in `@nimara/infrastructure/cms-menu/select`.
 * This function is only used by the service registry.
 * @internal
 */
export const createCMSMenuServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: resolveCMSProvider,
    build: (provider, log) =>
      createCMSMenuService(provider, buildCMSMenuConfig(log)),
    emptyService: emptyCMSMenuService,
    logger,
  });
