import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import { handleMutationErrors } from "../../../error";
import type {
  CheckoutCustomerAttachInfra,
  SaleorCheckoutServiceConfig,
} from "../../types";
import { CheckoutCustomerAttachMutationDocument } from "../graphql/mutations/generated";

export const saleorCheckoutCustomerAttachInfra =
  ({
    apiURL,
    logger,
  }: SaleorCheckoutServiceConfig): CheckoutCustomerAttachInfra =>
  async ({ id, accessToken }) => {
    const result = await graphqlClient(apiURL, accessToken).execute(
      CheckoutCustomerAttachMutationDocument,
      {
        variables: {
          id,
        },
        operationName: "CheckoutCustomerAttachMutation",
      },
    );

    if (!result.ok) {
      logger.error(
        `Couldn't attach the checkout with the ID: ${id} to the customer`,
        {
          error: result.errors,
        },
      );

      return result;
    }

    if (!result.data?.checkoutCustomerAttach) {
      logger.error(
        `Couldn't attach the checkout with the ID: ${id} to the customer`,
        {
          error: "No data returned",
        },
      );

      return err([
        {
          code: "CHECKOUT_CUSTOMER_ATTACH_ERROR",
          message: "No data returned",
        },
      ]);
    }

    if (result.data.checkoutCustomerAttach.errors.length) {
      logger.error(
        `Couldn't attach the checkout with the ID: ${id} to the customer`,
        {
          error: result.data.checkoutCustomerAttach.errors,
        },
      );

      return err(
        handleMutationErrors(result.data.checkoutCustomerAttach.errors),
      );
    }

    return ok({ success: true });
  };
