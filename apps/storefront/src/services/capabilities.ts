import type { CapabilityServices } from "@nimara/infrastructure/types";

/**
 * The log name of every registry capability, keyed by its getter. Service
 * loaders and the integration doctor label their logs with these names, and
 * `satisfies` fails to compile until a new getter is named here.
 */
export const CAPABILITY_NAMES = {
  getAddressService: "address",
  getCMSMenuService: "cms-menu",
  getCMSPageService: "cms-page",
  getCartService: "cart",
  getCategoryService: "category",
  getCheckoutService: "checkout",
  getCollectionService: "collection",
  getMarketplaceService: "marketplace",
  getPaymentService: "payment",
  getSearchService: "search",
  getStoreService: "store",
  getTrackingService: "tracking",
  getUserService: "user",
} as const satisfies Record<keyof CapabilityServices, string>;

export type Capability =
  (typeof CAPABILITY_NAMES)[keyof typeof CAPABILITY_NAMES];
