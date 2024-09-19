import type { BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";
import { loggingService } from "#root/logging/service";

import { CheckoutRemovePromoCodeMutationDocument } from "../graphql/mutations/generated";
import type {
  CheckoutRemovePromoCodeInfra,
  SaleorCheckoutServiceConfig,
} from "../types";

export const saleorCheckoutRemovePromoCodeInfra = ({
  apiURL,
}: SaleorCheckoutServiceConfig): CheckoutRemovePromoCodeInfra => {
  return async ({ checkoutId, promoCode }) => {
    const { data, error } = await graphqlClient(apiURL).execute(
      CheckoutRemovePromoCodeMutationDocument,
      {
        variables: {
          checkoutId: checkoutId,
          promoCode,
        },
      },
    );

    if (error) {
      loggingService.error("Failed to remove promo code", error);

      return {
        isSuccess: false,
        serverError: error as BaseError,
      };
    }

    if (data?.checkoutRemovePromoCode?.errors?.length) {
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
