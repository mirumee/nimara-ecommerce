import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type { CartCreateInfra, SaleorCartServiceConfig } from "../../types";
import { CartCreateMutationDocument } from "../graphql/generated";

export const saleorCartCreateInfra =
  ({
    apiURI,
    channel,
    languageCode,
    logger,
  }: SaleorCartServiceConfig): CartCreateInfra =>
  async ({ lines, email, options }) => {
    const result = await graphqlClient(apiURI).execute(
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
        operationName: "CartCreateMutation",
      },
    );

    if (!result.ok) {
      logger.error("Unexpected error while creating a checkout", {
        errors: result.errors,
        channel,
        languageCode,
      });

      return result;
    }

    if (result.data.checkoutCreate?.errors.length) {
      logger.error("Checkout create mutation returned errors.", {
        error: result.data.checkoutCreate.errors,
        channel,
        languageCode,
      });

      return err([
        {
          code: "CART_CREATE_ERROR",
        },
      ]);
    }

    if (!result.data.checkoutCreate?.checkout) {
      logger.error("No checkout was returned from Saleor", {
        error: result.data.checkoutCreate,
        channel,
        languageCode,
      });

      return err([
        {
          code: "CART_CREATE_ERROR",
        },
      ]);
    }

    return ok({ cartId: result.data.checkoutCreate.checkout.id });
  };
