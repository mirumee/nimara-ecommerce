import { type BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";
import { addressToInput } from "#root/public/saleor/address/helpers";

import { CheckoutBillingAddressUpdateMutationDocument } from "../graphql/mutations/generated";
import type {
  CheckoutBillingAddressUpdateInfra,
  SaleorCheckoutServiceConfig,
} from "../types";

export const saleorCheckoutBillingAddressUpdateInfra =
  ({
    apiURL,
    logger,
  }: SaleorCheckoutServiceConfig): CheckoutBillingAddressUpdateInfra =>
  async ({ checkoutId, address }) => {
    const { data, error } = await graphqlClient(apiURL).execute(
      CheckoutBillingAddressUpdateMutationDocument,
      {
        variables: {
          checkoutId,
          address: addressToInput(address),
        },
      },
    );

    if (error) {
      logger.error("Failed to update checkout billing address", {
        error,
        checkoutId,
      });

      return {
        isSuccess: false,
        serverError: error as BaseError,
      };
    }

    if (data?.checkoutBillingAddressUpdate?.errors?.length) {
      logger.error("Failed to update checkout billing address", {
        errors: data?.checkoutBillingAddressUpdate?.errors,
        checkoutId,
      });

      return {
        isSuccess: false,
        validationErrors: data?.checkoutBillingAddressUpdate?.errors,
      };
    }

    return {
      isSuccess: true,
    };
  };
