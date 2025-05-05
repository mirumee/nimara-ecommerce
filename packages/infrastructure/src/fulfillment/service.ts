import { fulfillmentReturnProductsUseCase } from "#root/use-cases/fulfillment/fulfillment-return-products-use-case";

import { saleorFulfillmentReturnProductsInfra } from "./saleor/infrastructure/fulfillment-return-products-infra";
import type {
  FulfillmentService,
  SaleorFulfillmentServiceConfig,
} from "./types";

export const saleorFulfillmentService: FulfillmentService<
  SaleorFulfillmentServiceConfig
> = (serviceConfig) => ({
  fulfillmentReturnProducts: fulfillmentReturnProductsUseCase({
    fulfillmentReturnProducts:
      saleorFulfillmentReturnProductsInfra(serviceConfig),
  }),
});
