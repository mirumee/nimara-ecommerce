import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";
import { handleMutationErrors } from "#root/public/saleor/error";

import { CheckoutDeliveryMethodUpdateMutationDocument } from "../graphql/mutations/generated";
import type {
  CheckoutDeliveryMethodOptions,
  CheckoutDeliveryMethodUpdateInfra,
  SaleorCheckoutServiceConfig,
} from "../types";

export const saleorDeliveryMethodUpdateInfra =
  ({
    apiURL,
    logger,
  }: SaleorCheckoutServiceConfig): CheckoutDeliveryMethodUpdateInfra =>
  async ({ checkout, deliveryMethodId }: CheckoutDeliveryMethodOptions) => {
    const result = await graphqlClientV2(apiURL).execute(
      CheckoutDeliveryMethodUpdateMutationDocument,
      {
        variables: {
          checkoutId: checkout.id,
          deliveryMethodId,
        },
        operationName: "CheckoutDeliveryMethodUpdateMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to update delivery method", {
        error: result.errors,
        checkoutId: checkout.id,
      });

      return result;
    }

    if (result.data?.checkoutDeliveryMethodUpdate?.errors?.length) {
      logger.error("Failed to update delivery method", {
        error: result.data?.checkoutDeliveryMethodUpdate?.errors,
        checkoutId: checkout.id,
      });

      return err(
        handleMutationErrors(result.data.checkoutDeliveryMethodUpdate.errors),
      );
    }

    return ok({ success: true });
  };
