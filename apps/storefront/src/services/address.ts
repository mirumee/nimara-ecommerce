import { saleorAddressService } from "@nimara/infrastructure/address/index";

import { clientEnvs } from "@/envs/client";
import { storefrontLogger } from "@/services/logging";

export const addressService = saleorAddressService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  logger: storefrontLogger,
});
