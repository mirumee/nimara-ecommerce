import { getProductBasicDetailsUseCase } from "#root/use-cases/store/get-product-basic-details-use-case";
import { getProductDetailsUseCase } from "#root/use-cases/store/get-product-details-use-case";

import { getProductAvailabilityDetailsInfra } from "./infrastructure/get-product-availability-details-infra";
import { getProductBasicDetailsInfra } from "./infrastructure/get-product-basic-details-infra";
import { getProductDetailsInfra } from "./infrastructure/get-product-details-infra";
import type { SaleorProductServiceConfig, StoreService } from "./types";

export const saleorStoreService: StoreService<SaleorProductServiceConfig> = (
  config,
) => ({
  getProductDetails: getProductDetailsUseCase({
    getProductDetailsInfra: getProductDetailsInfra(config),
    getProductAvailabilityDetailsInfra:
      getProductAvailabilityDetailsInfra(config),
  }),
  getProductBasicDetails: getProductBasicDetailsUseCase({
    getProductBasicDetailsInfra: getProductBasicDetailsInfra(config),
  }),
});
