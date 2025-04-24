import { graphqlClient } from "#root/graphql/client";

import { handleMutationErrors } from "#root/public/saleor/error";
import { err, ok } from "@nimara/domain/objects/Result";
import { FulfillmentReturnProductsDocument } from "../grapqhql/mutations/generated";
import type {
  FulfillmentReturnProductsInfra,
  SaleorFulfillmentServiceConfig,
} from "../types";

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
