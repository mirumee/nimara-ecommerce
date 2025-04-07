import { graphqlClient } from "#root/graphql/client";

import { CartCreateMutationDocument } from "../graphql/generated";
import type { CartCreateInfra, SaleorCartServiceConfig } from "../types";

export const saleorCartCreateInfra =
  ({
    apiURI,
    channel,
    languageCode,
    logger,
  }: SaleorCartServiceConfig): CartCreateInfra =>
  async ({ lines, email, options }) => {
    const { data } = await graphqlClient(apiURI).execute(
      CartCreateMutationDocument,
      {
        variables: {
          input: {
            ...(email && { email }),
            lines,
            channel,
            languageCode,
          },
        },
        options,
      },
    );
    const errors = data?.checkoutCreate?.errors ?? [];

    if (errors?.length) {
      logger.error("Error while creating a cart", { error: errors, channel });
    }

    const checkout = data?.checkoutCreate?.checkout;

    if (errors?.length || !checkout) {
      logger.error("Error while creating a cart", { error: errors, channel });

      return { errors, cartId: null };
    }

    return { errors: [], cartId: checkout.id };
  };
