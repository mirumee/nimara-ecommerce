import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import { handleMutationErrors } from "../../../error";
import type {
  CheckoutEmailUpdateInfra,
  SaleorCheckoutServiceConfig,
} from "../../types";
import { CheckoutEmailUpdateMutationDocument } from "../graphql/mutations/generated";

export const saleorCheckoutEmailUpdateInfra =
  ({ apiURL, logger }: SaleorCheckoutServiceConfig): CheckoutEmailUpdateInfra =>
  async ({ checkout, email }) => {
    const result = await graphqlClient(apiURL).execute(
      CheckoutEmailUpdateMutationDocument,
      {
        variables: {
          checkoutId: checkout.id,
          email,
        },
        operationName: "CheckoutEmailUpdateMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to update email on checkout. Unexpected error.", {
        errors: result.errors,
        checkout: {
          id: checkout.id,
        },
      });

      return result;
    }

    if (!result.data?.checkoutEmailUpdate) {
      logger.error("Failed to update email on checkout. No data returned.", {
        checkout: {
          id: checkout.id,
        },
      });

      return err([
        {
          code: "CHECKOUT_EMAIL_UPDATE_ERROR",
          message: "No data returned",
        },
      ]);
    }

    if (result.data.checkoutEmailUpdate.errors.length) {
      logger.error("Failed to update email on checkout. Errors returned.", {
        errors: result.data.checkoutEmailUpdate.errors,
        checkout: {
          id: checkout.id,
        },
      });

      return err(handleMutationErrors(result.data.checkoutEmailUpdate.errors));
    }

    return ok({ success: true });
  };
