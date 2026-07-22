import type { AddressService } from "./address/types";
import type { CartService } from "./cart/types";
import type { CategoryService } from "./category/types";
import type { CheckoutService } from "./checkout/types";
import type { CollectionService } from "./collection/types";
import type { MarketplaceService } from "./marketplace/types";
import type { StripePaymentService } from "./payment/providers";
import type { StoreService } from "./store/types";
import type { TrackingService } from "./tracking/service";
import type { CMSMenuService } from "./use-cases/cms-menu/types";
import type { CMSPageService } from "./use-cases/cms-page/types";
import type { SearchService } from "./use-cases/search/types";
import type { UserService } from "./user/types";

/**
 * The single source of truth for the services the registry exposes: each lazy
 * getter mapped to the service it resolves. Add a capability here once — the
 * {@link ServiceRegistry} getters and the storefront's loader table are derived
 * from this map, so there is no separate interface to keep in sync.
 */
export type CapabilityServices = {
  getAddressService: AddressService;
  getCMSMenuService: CMSMenuService;
  getCMSPageService: CMSPageService;
  getCartService: CartService;
  getCategoryService: CategoryService;
  getCheckoutService: CheckoutService;
  getCollectionService: CollectionService;
  getMarketplaceService: MarketplaceService;
  getPaymentService: StripePaymentService;
  getSearchService: SearchService;
  getStoreService: StoreService;
  getTrackingService: TrackingService;
  getUserService: UserService;
};

export type ServiceRegistryConfig = {
  cacheTTL: {
    cart: number;
    cms: number;
    pdp: number;
  };
};

/**
 * Service registry passed to features via dependency injection. Services are
 * lazy-loaded and cached on first access. The getters are derived from
 * {@link CapabilityServices}.
 */
export type ServiceRegistry = {
  config: ServiceRegistryConfig;
} & {
  [K in keyof CapabilityServices]: () => Promise<CapabilityServices[K]>;
};
