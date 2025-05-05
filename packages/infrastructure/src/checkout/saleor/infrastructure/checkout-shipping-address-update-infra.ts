import { err, ok } from "@nimara/domain/objects/Result";

import { addressToInput } from "#root/address/helpers";
import { graphqlClient } from "#root/graphql/client";

import { handleMutationErrors } from "../../../error";
import type {
  CheckoutShippingAddressUpdateInfra,
  SaleorCheckoutServiceConfig,
} from "../../types";
import { CheckoutShippingAddressUpdateDocument } from "../graphql/mutations/generated";

export const saleorCheckoutShippingAddressUpdateInfra =
  ({
    apiURL,
    logger,
  }: SaleorCheckoutServiceConfig): CheckoutShippingAddressUpdateInfra =>
  async ({ checkoutId, address }) => {
    const result = await graphqlClient(apiURL).execute(
      CheckoutShippingAddressUpdateDocument,
      {
        variables: {
          checkoutId,
          shippingAddress: addressToInput(address),
        },
        operationName: "CheckoutShippingAddressUpdateMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to update shipping address", {
        error: result.errors,
        checkout: {
          id: checkoutId,
        },
      });

      return result;
    }

    if (!result.data?.checkoutShippingAddressUpdate) {
      logger.error("Failed to update shipping address", {
        error: "No data returned",
        checkout: {
          id: checkoutId,
        },
      });

      return err([
        {
          code: "CHECKOUT_SHIPPING_ADDRESS_UPDATE_ERROR",
          message: "No data returned",
        },
      ]);
    }

    if (result.data.checkoutShippingAddressUpdate.errors.length) {
      logger.error("Failed to update shipping address", {
        error: result.data.checkoutShippingAddressUpdate.errors,
        checkout: {
          id: checkoutId,
        },
      });

      return err(
        handleMutationErrors(result.data.checkoutShippingAddressUpdate.errors),
      );
    }

    return ok({ success: true });
  };
