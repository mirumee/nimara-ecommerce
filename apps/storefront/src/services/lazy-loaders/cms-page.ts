import type { Logger } from "@nimara/infrastructure/logging/types";

import {
  CMS_PAGE_PROVIDERS,
  resolveCMSPageProvider,
} from "@/services/integrations/cms-page";
import { createServiceLoader } from "@/services/integrations/create-loader";

import { emptyCMSPageService } from "./empty-services";

/**
 * Creates a lazy loader for the CMS page service. The active provider
 * (Saleor, ButterCMS, …) is selected at build time via `CMS_PAGE_PROVIDER`.
 * This function is only used by the service registry.
 * @internal
 */
export const createCMSPageServiceLoader = (logger: Logger) =>
  createServiceLoader({
    providers: CMS_PAGE_PROVIDERS,
    resolveProvider: resolveCMSPageProvider,
    emptyService: emptyCMSPageService,
    logger,
  });
