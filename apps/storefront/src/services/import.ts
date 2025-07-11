import { type StripePaymentService } from "@nimara/infrastructure/payment/providers";
import { type StoreService } from "@nimara/infrastructure/store/types";
import { type SearchService } from "@nimara/infrastructure/use-cases/search/types";
import { type UserService } from "@nimara/infrastructure/user/types";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { storefrontLogger } from "@/services/logging";

type ServiceMap = {
  PAYMENT: StripePaymentService;
  SEARCH: SearchService;
  STORE: StoreService;
  USER: UserService;
};

type ServiceType = keyof ServiceMap;

const LOADED_SERVICES: { [K in keyof ServiceMap]: ServiceMap[K] | null } = {
  PAYMENT: null,
  STORE: null,
  USER: null,
  SEARCH: null,
};

import {
  ALGOLIA_SEARCH_SERVICE_CONFIG,
  SALEOR_SEARCH_SERVICE_CONFIG,
} from "@/services/search";

/**
 * Lazy loads a service by its name.
 * This is useful for reducing the initial bundle size by loading services only when they are needed.
 * @param name The name of the service to load.
 * @returns
 */
export const lazyLoadService = async <T extends ServiceType>(
  name: T,
): Promise<ServiceMap[T]> => {
  // If the service is already loaded, return it immediately.
  if (LOADED_SERVICES[name]) {
    return LOADED_SERVICES[name] as ServiceMap[T];
  }

  switch (name) {
    case "PAYMENT":
      const { stripePaymentService } = await import(
        "@nimara/infrastructure/payment/providers"
      );

      LOADED_SERVICES.PAYMENT = stripePaymentService({
        apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
        secretKey: serverEnvs.STRIPE_SECRET_KEY,
        publicKey: clientEnvs.STRIPE_PUBLIC_KEY,
        environment: clientEnvs.ENVIRONMENT,
        gatewayAppId: clientEnvs.PAYMENT_APP_ID,
        logger: storefrontLogger,
      });

      break;
    case "SEARCH":
      if (clientEnvs.NEXT_PUBLIC_SEARCH_SERVICE === "ALGOLIA") {
        const { algoliaSearchService } = await import(
          "@nimara/infrastructure/search/algolia/provider"
        );

        LOADED_SERVICES.SEARCH = algoliaSearchService(
          ALGOLIA_SEARCH_SERVICE_CONFIG,
        );
      } else {
        const { saleorSearchService } = await import(
          "@nimara/infrastructure/search/saleor/provider"
        );

        LOADED_SERVICES.SEARCH = saleorSearchService(
          SALEOR_SEARCH_SERVICE_CONFIG,
        );
      }

      break;
    case "STORE":
      const { saleorStoreService } = await import(
        "@nimara/infrastructure/store/saleor/provider"
      );

      LOADED_SERVICES.STORE = saleorStoreService({
        apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
        logger: storefrontLogger,
      });
      break;
    case "USER":
      const { saleorUserService } = await import(
        "@nimara/infrastructure/user/index"
      );

      LOADED_SERVICES.USER = saleorUserService({
        apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
        logger: storefrontLogger,
      });
      break;
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Service ${name} is not supported.`);
  }

  return LOADED_SERVICES[name] as ServiceMap[T];
};
