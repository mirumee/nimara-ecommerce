import { graphqlClient } from "#root/graphql/client";

import { CheckoutCustomerAttachMutationDocument } from "../graphql/mutations/generated";
import type {
  CheckoutCustomerAttachInfra,
  SaleorCheckoutServiceConfig,
} from "../types";

export const saleorCheckoutCustomerAttachInfra =
  ({
    apiURL,
    logger,
  }: SaleorCheckoutServiceConfig): CheckoutCustomerAttachInfra =>
  async ({ id, accessToken }) => {
    const { data } = await graphqlClient(apiURL, accessToken).execute(
      CheckoutCustomerAttachMutationDocument,
      {
        variables: {
          id,
        },
      },
    );

    if (data?.checkoutCustomerAttach?.errors.length) {
      logger.error(
        `Couldn't attach the checkout with the ID: ${id} to the customer`,
        {
          error: data?.checkoutCustomerAttach?.errors[0],
        },
      );
    }

    return data?.checkoutCustomerAttach ?? null;
  };
