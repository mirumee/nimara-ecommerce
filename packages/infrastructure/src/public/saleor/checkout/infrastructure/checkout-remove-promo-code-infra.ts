import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";
import { handleMutationErrors } from "#root/public/saleor/error";

import { CheckoutRemovePromoCodeMutationDocument } from "../graphql/mutations/generated";
import type {
  CheckoutRemovePromoCodeInfra,
  SaleorCheckoutServiceConfig,
} from "../types";

export const saleorCheckoutRemovePromoCodeInfra =
  ({
    apiURL,
    logger,
  }: SaleorCheckoutServiceConfig): CheckoutRemovePromoCodeInfra =>
  async ({ checkoutId, promoCode }) => {
    const result = await graphqlClientV2(apiURL).execute(
      CheckoutRemovePromoCodeMutationDocument,
      {
        variables: {
          checkoutId,
          promoCode,
        },
        operationName: "CheckoutRemovePromoCodeMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to remove promo code", {
        errors: result.errors,
        checkoutId,
      });

      return result;
    }

    if (!result.data?.checkoutRemovePromoCode) {
      logger.error("Failed to remove promo code", {
        errors: "No data returned",
        checkoutId,
      });

      return err([
        {
          code: "DISCOUNT_CODE_REMOVE_ERROR",
          message: "No data returned",
        },
      ]);
    }

    if (result.data.checkoutRemovePromoCode.errors.length) {
      logger.error("Mutation checkoutRemovePromoCode returned errors", {
        errors: result.data.checkoutRemovePromoCode.errors,
        checkoutId,
      });

      return err(
        handleMutationErrors(result.data.checkoutRemovePromoCode.errors),
      );
    }

    return ok({ success: true });
  };
