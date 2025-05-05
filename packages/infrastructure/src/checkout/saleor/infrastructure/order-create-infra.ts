import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import { handleMutationErrors } from "../../../error";
import type {
  OrderCreateInfra,
  SaleorCheckoutServiceConfig,
} from "../../types";
import { CheckoutCompleteMutationDocument } from "../graphql/mutations/generated";

export const orderCreateInfra =
  ({ apiURL, logger }: SaleorCheckoutServiceConfig): OrderCreateInfra =>
  async ({ id }) => {
    const result = await graphqlClient(apiURL).execute(
      CheckoutCompleteMutationDocument,
      {
        variables: { id },
        operationName: "CheckoutCompleteMutation",
      },
    );

    if (!result.ok) {
      logger.critical("Failed to complete checkout", {
        error: result.errors,
        checkoutId: id,
      });

      return result;
    }

    if (!result.data.checkoutComplete?.order) {
      logger.critical("Mutation checkout complete did not returned an order", {
        error: result.data.checkoutComplete?.errors,
        checkoutId: id,
      });

      return err([
        {
          code: "CHECKOUT_COMPLETE_ERROR",
        },
      ]);
    }

    if (result.data.checkoutComplete.errors.length) {
      logger.critical("Checkout complete mutation returned errors", {
        errors: result.data.checkoutComplete.errors,
        checkoutId: id,
      });

      return err(handleMutationErrors(result.data.checkoutComplete.errors));
    }

    return ok({ orderId: result.data.checkoutComplete.order.id });
  };
