import { saleorCollectionService } from "@nimara/infrastructure/collection/providers";

import { clientEnvs } from "@/envs/client";
import { storefrontLogger } from "@/services/logging";

export const collectionService = saleorCollectionService({
  apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  logger: storefrontLogger,
});
