import type { Region } from "@nimara/foundation/regions/types.js";

import type { AddressService } from "./address/types";
import type { CartService } from "./cart/types";
import type { CheckoutService } from "./checkout/types";
import type { CollectionService } from "./collection/types";
import type { Logger } from "./logging/types";
import type { StoreService } from "./store/types";
import type { CMSMenuService } from "./use-cases/cms-menu/types";
import type { CMSPageService } from "./use-cases/cms-page/types";
import type { SearchService } from "./use-cases/search/types";
import type { UserService } from "./user/types";

/**
 * Service registry interface that contains all services available to features.
 * Services are initialized by the storefront and passed to features via dependency injection.
 * Services are lazy-loaded and only initialized when accessed.
 */
export interface ServiceRegistry {
  accessToken?: string;
  config: {
    cacheTTL: {
      cart: number;
      cms: number;
      pdp: number;
    };
  };
  /**
   * Gets the address service, initializing it lazily on first access.
   * The service is cached after first initialization.
   * @returns A promise that resolves to the address service instance
   */
  getAddressService(): Promise<AddressService>;
  /**
   * Gets the CMS menu service, initializing it lazily on first access.
   * The service is cached after first initialization.
   * @returns A promise that resolves to the CMS menu service instance
   */
  getCMSMenuService(): Promise<CMSMenuService>;
  /**
   * Gets the CMS page service, initializing it lazily on first access.
   * The service is cached after first initialization.
   * @returns A promise that resolves to the CMS page service instance
   */
  getCMSPageService(): Promise<CMSPageService>;
  /**
   * Gets the cart service, initializing it lazily on first access.
   * The service is cached after first initialization.
   * @returns A promise that resolves to the cart service instance
   */
  getCartService(): Promise<CartService>;
  /**
   * Gets the checkout service, initializing it lazily on first access.
   * The service is cached after first initialization.
   * @returns A promise that resolves to the checkout service instance
   */
  getCheckoutService(): Promise<CheckoutService>;
  /**
   * Gets the collection service, initializing it lazily on first access.
   * The service is cached after first initialization.
   * @returns A promise that resolves to the collection service instance
   */
  getCollectionService(): Promise<CollectionService>;
  /**
   * Gets the search service, initializing it lazily on first access.
   * The service is cached after first initialization.
   * @returns A promise that resolves to the search service instance
   */
  getSearchService(): Promise<SearchService>;
  /**
   * Gets the store service, initializing it lazily on first access.
   * The service is cached after first initialization.
   * @returns A promise that resolves to the store service instance
   */
  getStoreService(): Promise<StoreService>;
  /**
   * Gets the user service, initializing it lazily on first access.
   * The service is cached after first initialization.
   * @returns A promise that resolves to the user service instance
   */
  getUserService(): Promise<UserService>;
  logger: Logger;
  region: Region;
}
