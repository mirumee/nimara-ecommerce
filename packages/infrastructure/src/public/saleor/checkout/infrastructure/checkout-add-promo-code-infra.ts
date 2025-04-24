import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";
import { handleMutationErrors } from "#root/public/saleor/error";

import { CheckoutAddPromoCodeMutationDocument } from "../graphql/mutations/generated";
import type {
  CheckoutAddPromoCodeInfra,
  SaleorCheckoutServiceConfig,
} from "../types";

export const saleorCheckoutAddPromoCodeInfra =
  ({
    apiURL,
    logger,
  }: SaleorCheckoutServiceConfig): CheckoutAddPromoCodeInfra =>
  async ({ checkoutId, promoCode }) => {
    const result = await graphqlClientV2(apiURL).execute(
      CheckoutAddPromoCodeMutationDocument,
      {
        variables: {
          checkoutId,
          promoCode,
        },
        operationName: "CheckoutAddPromoCodeMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to apply promo code", {
        errors: result.errors,
        checkoutId,
      });

      return result;
    }

    if (!result.data?.checkoutAddPromoCode) {
      logger.error("Add promo code to checkout mutation returned no data", {
        checkoutId,
      });

      return err([{ code: "DISCOUNT_CODE_ADD_ERROR" }]);
    }

    if (result.data.checkoutAddPromoCode.errors.length) {
      logger.error("Add promo code to checkout mutation returned errors", {
        errors: result.data.checkoutAddPromoCode.errors,
        checkoutId,
      });

      return err(handleMutationErrors(result.data.checkoutAddPromoCode.errors));
    }

    return ok({
      success: true,
    });
  };
