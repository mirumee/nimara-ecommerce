import { getLogger } from "@nimara/infrastructure/logging/service";
import type { Logger } from "@nimara/infrastructure/logging/types";
import type {
  CapabilityServices,
  ServiceRegistry,
} from "@nimara/infrastructure/types";

import { CACHE_TTL } from "@/config";
import { createAddressServiceLoader } from "@/services/lazy-loaders/address";
import { createCheckoutServiceLoader } from "@/services/lazy-loaders/checkout";
import { createMarketplaceServiceLoader } from "@/services/lazy-loaders/marketplace";
import { createPaymentServiceLoader } from "@/services/lazy-loaders/payment";

import { createCartServiceLoader } from "./lazy-loaders/cart";
import { createCMSMenuServiceLoader } from "./lazy-loaders/cms-menu";
import { createCMSPageServiceLoader } from "./lazy-loaders/cms-page";
import { createCollectionServiceLoader } from "./lazy-loaders/collection";
import { createSearchServiceLoader } from "./lazy-loaders/search";
import { createStoreServiceLoader } from "./lazy-loaders/store";
import { createUserServiceLoader } from "./lazy-loaders/user";

let serviceRegistryInstance: ServiceRegistry | null = null;

/**
 * Maps each registry getter to the loader that builds it. This is the single
 * place to register a capability's loader — both the assembly below and the
 * `ServiceRegistry` type ({@link CapabilityServices}) are derived from it.
 */
const SERVICE_LOADERS = {
  getAddressService: createAddressServiceLoader,
  getCMSMenuService: createCMSMenuServiceLoader,
  getCMSPageService: createCMSPageServiceLoader,
  getCartService: createCartServiceLoader,
  getCheckoutService: createCheckoutServiceLoader,
  getCollectionService: createCollectionServiceLoader,
  getMarketplaceService: createMarketplaceServiceLoader,
  getPaymentService: createPaymentServiceLoader,
  getSearchService: createSearchServiceLoader,
  getStoreService: createStoreServiceLoader,
  getUserService: createUserServiceLoader,
} satisfies {
  [K in keyof CapabilityServices]: (logger: Logger) => ServiceRegistry[K];
};

/**
 * Initializes and returns the service registry singleton. The registry is
 * cached after first initialization; services are lazy-loaded and only
 * initialized when accessed.
 */
export const getServiceRegistry = async (): Promise<ServiceRegistry> => {
  if (serviceRegistryInstance) {
    return serviceRegistryInstance;
  }

  const logger = getLogger({ name: "storefront" });

  const getters = Object.fromEntries(
    Object.entries(SERVICE_LOADERS).map(([key, createLoader]) => [
      key,
      createLoader(logger),
    ]),
  ) as Omit<ServiceRegistry, "config">;

  serviceRegistryInstance = {
    config: { cacheTTL: CACHE_TTL },
    ...getters,
  };

  return serviceRegistryInstance;
};
