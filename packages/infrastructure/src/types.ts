import type { StoreService } from "./store/types";
import type { Logger } from "./logging/types";
import type { Region } from "@nimara/foundation/regions/types.js";
import { CartService } from "./cart/types";
import type { UserService } from "./user/types";
import type { SearchService } from "./use-cases/search/types";
import type { CMSPageService } from "./use-cases/cms-page/types";
import type { CollectionService } from "./collection/types";

/**
 * Service registry interface that contains all services available to features.
 * Services are initialized by the storefront and passed to features via dependency injection.
 */
export interface ServiceRegistry {
    config: {
        cacheTTL: {
            pdp: number;
            cart: number;
            cms: number;
        };
    };
    accessToken?: string;
    region: Region;
    logger: Logger;
    store: StoreService;
    cart: CartService;
    user: UserService;
    search: SearchService;
    cms: CMSPageService;
    collection: CollectionService;
}


