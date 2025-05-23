import { saleorCheckoutService } from "@nimara/infrastructure/checkout/service";

import { clientEnvs } from "@/envs/client";
import { storefrontLogger } from "@/services/logging";

export const checkoutService = saleorCheckoutService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  logger: storefrontLogger,
});
