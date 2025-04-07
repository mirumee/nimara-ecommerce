import type { BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";

import { CheckoutRemovePromoCodeMutationDocument } from "../graphql/mutations/generated";
import type {
  CheckoutRemovePromoCodeInfra,
  SaleorCheckoutServiceConfig,
} from "../types";

export const saleorCheckoutRemovePromoCodeInfra = ({
  apiURL,
  logger,
}: SaleorCheckoutServiceConfig): CheckoutRemovePromoCodeInfra => {
  return async ({ checkoutId, promoCode }) => {
    const { data, error } = await graphqlClient(apiURL).execute(
      CheckoutRemovePromoCodeMutationDocument,
      {
        variables: {
          checkoutId,
          promoCode,
        },
      },
    );

    if (error) {
      logger.error("Failed to remove promo code", { error, checkoutId });

      return {
        isSuccess: false,
        serverError: error as BaseError,
      };
    }

    if (data?.checkoutRemovePromoCode?.errors?.length) {
      logger.error("Failed to remove promo code", {
        errors: data?.checkoutRemovePromoCode?.errors,
        checkoutId,
      });

      return {
        isSuccess: false,
        validationErrors: data.checkoutRemovePromoCode.errors,
      };
    }

    return {
      isSuccess: true,
    };
  };
};
