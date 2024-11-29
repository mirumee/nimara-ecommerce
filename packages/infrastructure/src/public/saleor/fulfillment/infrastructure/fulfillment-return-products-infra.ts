import type { BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";
import { loggingService } from "#root/logging/service";

import { FulfillmentReturnProductsDocument } from "../grapqhql/mutations/generated";
import type {
  FulfillmentReturnProductsInfra,
  SaleorFulfillmentServiceConfig,
} from "../types";

export const saleorFulfillmentReturnProductsInfra =
  ({
    apiURL,
    appToken = "",
  }: SaleorFulfillmentServiceConfig): FulfillmentReturnProductsInfra =>
  async ({ order, input }) => {
    const { data, error } = await graphqlClient(apiURL, appToken).execute(
      FulfillmentReturnProductsDocument,
      {
        variables: { order, input },
      },
    );

    if (error) {
      loggingService.error("Failed to return products", error);

      return {
        isSuccess: false,
        serverError: error as BaseError,
      };
    }

    if (data?.orderFulfillmentReturnProducts?.errors?.length) {
      return {
        isSuccess: false,
        validationErrors: data.orderFulfillmentReturnProducts.errors,
      };
    }

    const isReturned =
      data?.orderFulfillmentReturnProducts?.returnFulfillment?.status ===
      "RETURNED";

    if (!isReturned) {
      return { isSuccess: false };
    }

    return { isSuccess: true };
  };
