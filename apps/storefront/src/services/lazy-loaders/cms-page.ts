import { createCMSPageService } from "@nimara/infrastructure/cms-page/select";
import type { Logger } from "@nimara/infrastructure/logging/types";

import { buildCMSPageConfig } from "@/services/integrations/cms-page";
import { createServiceLoader } from "@/services/integrations/create-loader";
import { resolveCMSProvider } from "@/services/integrations/resolve";

import { emptyCMSPageService } from "./empty-services";

/**
 * Creates a lazy loader for the CMS page service. The storefront only selects
 * the provider (via env) and supplies its config — the provider catalog and
 * wiring live in `@nimara/infrastructure/cms-page/select`.
 * This function is only used by the service registry.
 * @internal
 */
export const createCMSPageServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: resolveCMSProvider,
    build: (provider, log) =>
      createCMSPageService(provider, buildCMSPageConfig(log)),
    emptyService: emptyCMSPageService,
    logger,
  });
