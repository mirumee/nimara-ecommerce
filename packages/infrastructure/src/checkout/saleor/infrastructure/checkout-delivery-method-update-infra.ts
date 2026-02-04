import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import { handleMutationErrors } from "../../../error";
import type {
  CheckoutDeliveryMethodOptions,
  CheckoutDeliveryMethodUpdateInfra,
  SaleorCheckoutServiceConfig,
} from "../../types";
import { CheckoutDeliveryMethodUpdateMutationDocument } from "../graphql/mutations/generated";

export const saleorDeliveryMethodUpdateInfra =
  ({
    apiURL,
    logger,
  }: SaleorCheckoutServiceConfig): CheckoutDeliveryMethodUpdateInfra =>
  async ({ checkoutId, deliveryMethodId }: CheckoutDeliveryMethodOptions) => {
    const result = await graphqlClient(apiURL).execute(
      CheckoutDeliveryMethodUpdateMutationDocument,
      {
        variables: {
          checkoutId,
          deliveryMethodId,
        },
        operationName: "CheckoutDeliveryMethodUpdateMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to update delivery method", {
        error: result.errors,
        checkoutId,
      });

      return result;
    }

    if (result.data?.checkoutDeliveryMethodUpdate?.errors?.length) {
      logger.error("Failed to update delivery method", {
        error: result.data?.checkoutDeliveryMethodUpdate?.errors,
        checkoutId,
      });

      return err(
        handleMutationErrors(result.data.checkoutDeliveryMethodUpdate.errors),
      );
    }

    return ok({ success: true });
  };
