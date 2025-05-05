import { getCollectionDetailsUseCase } from "#root/use-cases/collection/get-collection-details-use-case";

import { getCollectionDetailsInfra } from "./saleor/infrastructure/get-collection-details-infra";
import {
  type CollectionService,
  type SaleorCollectionServiceConfig,
} from "./types";

export const saleorCollectionService = (
  config: SaleorCollectionServiceConfig,
): CollectionService => ({
  getCollectionDetails: getCollectionDetailsUseCase({
    getCollectionDetailsInfra: getCollectionDetailsInfra(config),
  }),
});
