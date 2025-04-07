import type { BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";

import { CheckoutAddPromoCodeMutationDocument } from "../graphql/mutations/generated";
import type {
  CheckoutAddPromoCodeInfra,
  SaleorCheckoutServiceConfig,
} from "../types";

export const saleorCheckoutAddPromoCodeInfra = ({
  apiURL,
  logger,
}: SaleorCheckoutServiceConfig): CheckoutAddPromoCodeInfra => {
  return async ({ checkoutId, promoCode }) => {
    const { data, error } = await graphqlClient(apiURL).execute(
      CheckoutAddPromoCodeMutationDocument,
      {
        variables: {
          checkoutId,
          promoCode,
        },
      },
    );

    if (error) {
      logger.error("Failed to apply promo code", { error, checkoutId });

      return {
        isSuccess: false,
        serverError: error as BaseError,
      };
    }

    if (data?.checkoutAddPromoCode?.errors?.length) {
      logger.error("Failed to apply promo code", {
        errors: data?.checkoutAddPromoCode?.errors,
        checkoutId,
      });

      return {
        isSuccess: false,
        validationErrors: data.checkoutAddPromoCode.errors,
      };
    }

    return {
      isSuccess: true,
    };
  };
};
