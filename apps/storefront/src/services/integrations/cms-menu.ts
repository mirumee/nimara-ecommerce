import { type CMSMenuServiceConfig } from "@nimara/infrastructure/cms-menu/select";
import type { Logger } from "@nimara/infrastructure/logging/types";

import { clientEnvs } from "@/envs/client";

/**
 * App-owned configuration passed to the infrastructure CMS menu factory. Each
 * section is included only when its data is present; the selected provider's
 * section is validated by `createCMSMenuService`.
 */
export const buildCMSMenuConfig = (logger: Logger): CMSMenuServiceConfig => ({
  logger,
  butterCMS: clientEnvs.BUTTER_CMS_API_KEY
    ? { token: clientEnvs.BUTTER_CMS_API_KEY }
    : undefined,
  saleor: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL
    ? { apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL }
    : undefined,
});
