import { err } from "@nimara/domain/objects/Result";
import { saleorFulfillmentService } from "@nimara/infrastructure/fulfillment/service";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { storefrontLogger } from "@/services/logging";

let loadedService: ReturnType<typeof saleorFulfillmentService> | null = null;

const getFulfillmentService = () => {
  if (loadedService) {
    return loadedService;
  }

  const apiURL = clientEnvs.NEXT_PUBLIC_SALEOR_API_URL;
  const appToken = serverEnvs.SALEOR_APP_TOKEN;

  if (!apiURL || !appToken) {
    return null;
  }

  loadedService = saleorFulfillmentService({
    apiURL,
    appToken,
    logger: storefrontLogger,
  });

  return loadedService;
};

export const fulfillmentService = {
  fulfillmentReturnProducts: async (...args) => {
    const service = getFulfillmentService();

    if (!service) {
      return err([
        {
          code: "NOT_AVAILABLE_ERROR",
          message: "Saleor fulfillment service is not configured.",
        },
      ]);
    }

    return service.fulfillmentReturnProducts(...args);
  },
} satisfies ReturnType<typeof saleorFulfillmentService>;
