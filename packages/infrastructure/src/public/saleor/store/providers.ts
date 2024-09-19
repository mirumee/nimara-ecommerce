import { getProductDetailsUseCase } from "#root/use-cases/store/get-product-details-use-case";

import { getProductAvailabilityDetailsInfra } from "./infrastructure/get-product-availability-details-infra";
import { getProductDetailsInfra } from "./infrastructure/get-product-details-infra";
import type { SaleorStoreServiceConfig, StoreService } from "./types";

export const saleorStoreService: StoreService<SaleorStoreServiceConfig> = (
  config,
) => ({
  getProductDetails: getProductDetailsUseCase({
    getProductDetailsInfra: getProductDetailsInfra(config),
    getProductAvailabilityDetailsInfra:
      getProductAvailabilityDetailsInfra(config),
  }),
});
