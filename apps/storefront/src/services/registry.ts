import { getLogger } from "@nimara/infrastructure/logging/service";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

import { clientEnvs } from "@/envs/client";
import { saleorStoreService } from "@nimara/infrastructure/store/saleor/provider";
import { CACHE_TTL } from "@/config";
import { getCurrentRegion } from "../foundation/regions";
import { saleorCartService } from "@nimara/infrastructure/cart/providers";
import { saleorUserService } from "@nimara/infrastructure/user/index";
import { SALEOR_SEARCH_SERVICE_CONFIG } from "./search";
import { saleorSearchService } from "@nimara/infrastructure/search/saleor/provider";
import { saleorCMSPageService } from "@nimara/infrastructure/cms-page/providers";
import { saleorCollectionService } from "@nimara/infrastructure/collection/providers";
import { getAccessToken } from "@/auth";

let serviceRegistryInstance: ServiceRegistry | null = null;

/**
 * Initializes and returns the service registry singleton.
 * This should be called once at application startup or on-demand.
 * The registry is cached after first initialization.
 * 
 * @returns A promise that resolves to the service registry instance
 */
export const getServiceRegistry = async (): Promise<ServiceRegistry> => {
    if (serviceRegistryInstance) {
        return serviceRegistryInstance;
    }

    const config = {
        cacheTTL: CACHE_TTL
    }

    const region = await getCurrentRegion();

    const accessToken = await getAccessToken();

    const logger = getLogger({ name: "storefront" });

    const store = saleorStoreService({
        apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
        logger,
    });
    const cart = saleorCartService({
        apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
        logger,
    });
    const user = saleorUserService({
        apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
        logger,
    });
    const search = saleorSearchService(
        SALEOR_SEARCH_SERVICE_CONFIG(logger), // TODO What to do with this?
    );
    const cms = saleorCMSPageService({
        apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
        logger,
    });
    const collection = saleorCollectionService({
        apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
        logger,
    });

    return {
        config,
        accessToken,
        region,
        logger,
        store,
        cart,
        user,
        search,
        cms,
        collection,
    };
};

