import type { Region } from "@nimara/foundation/regions/types.js";

import { type CartService } from "./cart/types";
import type { CollectionService } from "./collection/types";
import type { Logger } from "./logging/types";
import type { StoreService } from "./store/types";
import type { CMSPageService } from "./use-cases/cms-page/types";
import type { SearchService } from "./use-cases/search/types";
import type { UserService } from "./user/types";

/**
 * Service registry interface that contains all services available to features.
 * Services are initialized by the storefront and passed to features via dependency injection.
 */
export interface ServiceRegistry {
  accessToken?: string;
  cart: CartService;
  cms: CMSPageService;
  collection: CollectionService;
  config: {
    cacheTTL: {
      cart: number;
      cms: number;
      pdp: number;
    };
  };
  logger: Logger;
  region: Region;
  search: SearchService;
  store: StoreService;
  user: UserService;
}
