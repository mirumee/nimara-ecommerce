import type { BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";
import { addressToInput } from "#root/public/saleor/address/helpers";

import { CheckoutShippingAddressUpdateDocument } from "../graphql/mutations/generated";
import type {
  CheckoutShippingAddressUpdateInfra,
  SaleorCheckoutServiceConfig,
} from "../types";

export const saleorCheckoutShippingAddressUpdateInfra = ({
  apiURL,
  logger,
}: SaleorCheckoutServiceConfig): CheckoutShippingAddressUpdateInfra => {
  return async ({ checkoutId, address }) => {
    const { data, error } = await graphqlClient(apiURL).execute(
      CheckoutShippingAddressUpdateDocument,
      {
        variables: {
          checkoutId,
          shippingAddress: addressToInput(address),
        },
      },
    );

    if (error) {
      logger.error("Failed to update shipping address", {
        error,
        checkoutId,
      });

      return {
        isSuccess: false,
        serverError: error as BaseError,
      };
    }

    if (data?.checkoutShippingAddressUpdate?.errors?.length) {
      logger.error("Failed to update shipping address", {
        errors: data?.checkoutShippingAddressUpdate?.errors,
        checkoutId,
      });

      return {
        isSuccess: false,
        validationErrors: data?.checkoutShippingAddressUpdate?.errors,
      };
    }

    return {
      isSuccess: true,
    };
  };
};
