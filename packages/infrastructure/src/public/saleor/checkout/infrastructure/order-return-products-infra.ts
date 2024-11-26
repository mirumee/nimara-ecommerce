import type { BaseError } from "@nimara/domain/objects/Error";

import { secureSaleorClient } from "#root/graphql/client";
import { loggingService } from "#root/logging/service";

import { FulfillmentReturnProductsDocument } from "../graphql/mutations/generated";
import type {
  OrderReturnProductsInfra,
  SaleorCheckoutServiceConfig,
} from "../types";

export const orderReturnProductsInfra =
  ({
    apiURL,
    appToken = "",
  }: SaleorCheckoutServiceConfig): OrderReturnProductsInfra =>
  async ({ order, input }) => {
    const { data, error } = await secureSaleorClient({
      apiURL,
      appToken,
    }).execute(FulfillmentReturnProductsDocument, {
      variables: { order, input },
    });

    if (error) {
      loggingService.error("Failed to return products", error);

      return {
        isSuccess: false,
        serverError: error as BaseError,
      };
    }

    const isReturned =
      data?.orderFulfillmentReturnProducts?.returnFulfillment?.status ===
      "RETURNED";

    if (data?.orderFulfillmentReturnProducts?.errors?.length) {
      return {
        isSuccess: false,
        validationErrors: data.orderFulfillmentReturnProducts.errors,
      };
    }

    if (!isReturned) {
      return { isSuccess: false };
    }

    return { isSuccess: true };
  };
