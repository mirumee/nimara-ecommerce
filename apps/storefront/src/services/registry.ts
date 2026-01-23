import { getLogger } from "@nimara/infrastructure/logging/service";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

import { CACHE_TTL } from "@/config";

import { getCurrentRegion } from "../foundation/regions";
import { createCartServiceLoader } from "./lazy-loaders/cart";
import { createCMSMenuServiceLoader } from "./lazy-loaders/cms-menu";
import { createCMSPageServiceLoader } from "./lazy-loaders/cms-page";
import { createCollectionServiceLoader } from "./lazy-loaders/collection";
import { createSearchServiceLoader } from "./lazy-loaders/search";
import { createStoreServiceLoader } from "./lazy-loaders/store";
import { createUserServiceLoader } from "./lazy-loaders/user";
import { getAccessToken } from "./tokens";

let serviceRegistryInstance: ServiceRegistry | null = null;

/**
 * Initializes and returns the service registry singleton.
 * This should be called once at application startup or on-demand.
 * The registry is cached after first initialization.
 * Services are lazy-loaded and only initialized when accessed.
 *
 * @returns A promise that resolves to the service registry instance
 */
export const getServiceRegistry = async (): Promise<ServiceRegistry> => {
  if (serviceRegistryInstance) {
    return serviceRegistryInstance;
  }

  const config = {
    cacheTTL: CACHE_TTL,
  };

  const region = await getCurrentRegion();

  const accessToken = await getAccessToken();

  const logger = getLogger({ name: "storefront" });

  // Create lazy loaders for each service
  const getStoreService = createStoreServiceLoader(logger);
  const getCartService = createCartServiceLoader(logger);
  const getUserService = createUserServiceLoader(logger);
  const getSearchService = createSearchServiceLoader(logger);
  const getCMSPageService = createCMSPageServiceLoader(logger);
  const getCMSMenuService = createCMSMenuServiceLoader(logger);
  const getCollectionService = createCollectionServiceLoader(logger);

  serviceRegistryInstance = {
    config,
    accessToken,
    region,
    logger,
    getStoreService,
    getCartService,
    getUserService,
    getSearchService,
    getCMSPageService,
    getCMSMenuService,
    getCollectionService,
  };

  return serviceRegistryInstance;
};
