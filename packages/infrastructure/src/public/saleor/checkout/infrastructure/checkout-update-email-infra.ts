import type { BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";

import { CheckoutEmailUpdateMutationDocument } from "../graphql/mutations/generated";
import type {
  CheckoutEmailUpdateInfra,
  SaleorCheckoutServiceConfig,
} from "../types";

export const saleorCheckoutEmailUpdateInfra = ({
  apiURL,
  logger,
}: SaleorCheckoutServiceConfig): CheckoutEmailUpdateInfra => {
  return async ({ checkout, email }) => {
    const { data, error } = await graphqlClient(apiURL).execute(
      CheckoutEmailUpdateMutationDocument,
      {
        variables: {
          checkoutId: checkout.id,
          email,
        },
      },
    );

    if (error) {
      logger.error("Failed to update checkout email", {
        error,
        checkoutId: checkout.id,
      });

      return {
        isSuccess: false,
        serverError: error as BaseError,
      };
    }

    if (data?.checkoutEmailUpdate?.errors?.length) {
      logger.error("Failed to update checkout email", {
        errors: data?.checkoutEmailUpdate?.errors,
        checkoutId: checkout.id,
      });

      return {
        isSuccess: false,
        validationErrors: data?.checkoutEmailUpdate?.errors,
      };
    }

    return {
      isSuccess: true,
    };
  };
};
