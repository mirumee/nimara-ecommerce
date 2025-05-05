import { err, ok } from "@nimara/domain/objects/Result";

import { handleMutationErrors } from "#root/error";
import { graphqlClient } from "#root/graphql/client";

import type {
  FulfillmentReturnProductsInfra,
  SaleorFulfillmentServiceConfig,
} from "../../types";
import { FulfillmentReturnProductsDocument } from "../grapqhql/mutations/generated";

export const saleorFulfillmentReturnProductsInfra =
  ({
    apiURL,
    appToken = "",
    logger,
  }: SaleorFulfillmentServiceConfig): FulfillmentReturnProductsInfra =>
  async ({ order, input }) => {
    const result = await graphqlClient(apiURL, appToken).execute(
      FulfillmentReturnProductsDocument,
      {
        variables: { order, input },
        operationName: "OrderFulfillmentReturnProductsMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to return products", {
        errors: result.errors,
        orderId: order,
      });

      return result;
    }

    if (result.data.orderFulfillmentReturnProducts?.errors.length) {
      logger.error("Order fulfillment mutation returned errors.", {
        errors: result.data.orderFulfillmentReturnProducts?.errors,
        orderId: order,
      });

      return err(
        handleMutationErrors(result.data.orderFulfillmentReturnProducts.errors),
      );
    }

    const isReturned =
      result.data.orderFulfillmentReturnProducts?.returnFulfillment?.status ===
      "RETURNED";

    if (!isReturned) {
      return ok({ success: false });
    }

    return ok({ success: true });
  };
