import { getProductBaseUseCase } from "#root/use-cases/store/get-product-basic-details-use-case";
import { getProductDetailsUseCase } from "#root/use-cases/store/get-product-details-use-case";
import { getProductRelatedProductsUseCase } from "#root/use-cases/store/get-product-related-products-use-case";

import type { StoreService, StoreServiceConfig } from "../types";
import { getProductAvailabilityDetailsInfra } from "./infrastructure/get-product-availability-details-infra";
import { getProductBaseInfra } from "./infrastructure/get-product-base-infra";
import { getProductDetailsInfra } from "./infrastructure/get-product-details-infra";
import { getProductRelatedProductsInfra } from "./infrastructure/get-product-related-products-infra";

export const saleorStoreService = (
  config: StoreServiceConfig,
): StoreService => ({
  getProductDetails: getProductDetailsUseCase({
    getProductDetailsInfra: getProductDetailsInfra(config),
    getProductAvailabilityDetailsInfra:
      getProductAvailabilityDetailsInfra(config),
  }),
  getProductBase: getProductBaseUseCase({
    getProductBaseInfra: getProductBaseInfra(config),
  }),
  getProductRelatedProducts: getProductRelatedProductsUseCase({
    getProductRelatedProductsInfra: getProductRelatedProductsInfra(config),
  }),
});
