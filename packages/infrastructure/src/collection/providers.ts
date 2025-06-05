import { getCollectionDetailsUseCase } from "#root/use-cases/collection/get-collection-details-use-case";
import { getCollectionsIDsBySlugsUseCase } from "#root/use-cases/collection/get-collections-ids-by-slugs-use-case";

import { getCollectionDetailsInfra } from "./saleor/infrastructure/get-collection-details-infra";
import { getCollectionsIDsBySlugsInfra } from "./saleor/infrastructure/get-collections-ids-by-slugs-infra";
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
  getCollectionsIDsBySlugs: getCollectionsIDsBySlugsUseCase({
    getCollectionsIDsBySlugsInfra: getCollectionsIDsBySlugsInfra(config),
  }),
});
