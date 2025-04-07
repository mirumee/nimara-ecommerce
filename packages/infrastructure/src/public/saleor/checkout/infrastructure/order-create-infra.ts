import { invariant } from "graphql/jsutils/invariant";

import { graphqlClient } from "#root/graphql/client";

import { CheckoutCompleteMutationDocument } from "../graphql/mutations/generated";
import type { OrderCreateInfra, SaleorCheckoutServiceConfig } from "../types";

export const orderCreateInfra =
  ({ apiURL, logger }: SaleorCheckoutServiceConfig): OrderCreateInfra =>
  async ({ id }) => {
    const { data } = await graphqlClient(apiURL).execute(
      CheckoutCompleteMutationDocument,
      {
        variables: { id },
      },
    );

    const errors = data?.checkoutComplete?.errors ?? [];
    const orderId = data?.checkoutComplete?.order?.id;

    if (errors.length) {
      logger.error("Failed to complete checkout", {
        errors,
        checkoutId: id,
      });

      return {
        errors: errors.map(({ code }) => ({ code, type: "checkout" })),
        orderId: null,
      };
    }

    invariant(
      orderId,
      "checkoutComplete succeeded but did not return order id.",
    );

    return { errors: [], orderId };
  };
