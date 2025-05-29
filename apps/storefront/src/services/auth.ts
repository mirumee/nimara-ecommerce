import { saleorAuthService } from "@nimara/infrastructure/auth/index";

import { clientEnvs } from "@/envs/client";
import { storefrontLogger } from "@/services/logging";

export const authService = saleorAuthService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  logger: storefrontLogger,
});
