import { saleorUserService } from "@nimara/infrastructure/user/index";

import { clientEnvs } from "@/envs/client";
import { storefrontLogger } from "@/services/logging";

export const userService = saleorUserService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  logger: storefrontLogger,
});
