import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import { handleMutationErrors } from "../../../error";
import type {
  CheckoutRemovePromoCodeInfra,
  SaleorCheckoutServiceConfig,
} from "../../types";
import { CheckoutRemovePromoCodeMutationDocument } from "../graphql/mutations/generated";

export const saleorCheckoutRemovePromoCodeInfra =
  ({
    apiURL,
    logger,
  }: SaleorCheckoutServiceConfig): CheckoutRemovePromoCodeInfra =>
  async ({ checkoutId, promoCode }) => {
    const result = await graphqlClient(apiURL).execute(
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
