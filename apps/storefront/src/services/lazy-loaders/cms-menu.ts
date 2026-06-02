import type { Logger } from "@nimara/infrastructure/logging/types";

import {
  CMS_MENU_PROVIDERS,
  resolveCMSMenuProvider,
} from "@/services/integrations/cms-menu";
import { createServiceLoader } from "@/services/integrations/create-loader";

import { emptyCMSMenuService } from "./empty-services";

/**
 * Creates a lazy loader for the CMS menu service. The active provider
 * (Saleor, ButterCMS, …) is selected at build time via `CMS_MENU_PROVIDER`.
 * This function is only used by the service registry.
 * @internal
 */
export const createCMSMenuServiceLoader = (logger: Logger) =>
  createServiceLoader({
    providers: CMS_MENU_PROVIDERS,
    resolveProvider: resolveCMSMenuProvider,
    emptyService: emptyCMSMenuService,
    logger,
  });
