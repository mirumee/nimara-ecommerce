import { saleorFulfillmentService } from "@nimara/infrastructure/fulfillment/service";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { storefrontLogger } from "@/services/logging";

export const fulfillmentService = saleorFulfillmentService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  appToken: serverEnvs.SALEOR_APP_TOKEN,
  logger: storefrontLogger,
});
