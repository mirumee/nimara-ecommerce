import { getLogger } from "@nimara/infrastructure/logging/service";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

import { CACHE_TTL } from "@/config";
import { getCurrentRegion } from "@/foundation/regions";
import { createAddressServiceLoader } from "@/services/lazy-loaders/address";
import { createCheckoutServiceLoader } from "@/services/lazy-loaders/checkout";
import { getAccessToken } from "@/services/tokens";

import { createCartServiceLoader } from "./lazy-loaders/cart";
import { createCMSMenuServiceLoader } from "./lazy-loaders/cms-menu";
import { createCMSPageServiceLoader } from "./lazy-loaders/cms-page";
import { createCollectionServiceLoader } from "./lazy-loaders/collection";
import { createSearchServiceLoader } from "./lazy-loaders/search";
import { createStoreServiceLoader } from "./lazy-loaders/store";
import { createUserServiceLoader } from "./lazy-loaders/user";

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

  const accessToken = await getAccessToken();
  const config = {
    cacheTTL: CACHE_TTL,
  };
  const logger = getLogger({ name: "storefront" });
  const region = await getCurrentRegion();

  // Create lazy loaders for each service
  const getAddressService = createAddressServiceLoader(logger);
  const getCartService = createCartServiceLoader(logger);
  const getCheckoutService = createCheckoutServiceLoader(logger);
  const getCMSMenuService = createCMSMenuServiceLoader(logger);
  const getCMSPageService = createCMSPageServiceLoader(logger);
  const getCollectionService = createCollectionServiceLoader(logger);
  const getSearchService = createSearchServiceLoader(logger);
  const getStoreService = createStoreServiceLoader(logger);
  const getUserService = createUserServiceLoader(logger);

  serviceRegistryInstance = {
    accessToken,
    config,
    logger,
    region,
    getAddressService,
    getCartService,
    getCheckoutService,
    getCMSMenuService,
    getCMSPageService,
    getCollectionService,
    getSearchService,
    getStoreService,
    getUserService,
  };

  return serviceRegistryInstance;
};
