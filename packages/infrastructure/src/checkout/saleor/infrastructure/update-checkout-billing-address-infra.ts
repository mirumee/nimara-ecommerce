import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";
import { addressToInput } from "#root/public/saleor/address/helpers";
import { handleMutationErrors } from "#root/public/saleor/error";

import type {
  CheckoutBillingAddressUpdateInfra,
  SaleorCheckoutServiceConfig,
} from "../../types";
import { CheckoutBillingAddressUpdateMutationDocument } from "../graphql/mutations/generated";

export const saleorCheckoutBillingAddressUpdateInfra =
  ({
    apiURL,
    logger,
  }: SaleorCheckoutServiceConfig): CheckoutBillingAddressUpdateInfra =>
  async ({ checkoutId, address }) => {
    const result = await graphqlClient(apiURL).execute(
      CheckoutBillingAddressUpdateMutationDocument,
      {
        variables: {
          checkoutId,
          address: addressToInput(address),
        },
        operationName: "CheckoutBillingAddressUpdateMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to update billing address", {
        errors: result.errors,
        checkoutId,
      });

      return result;
    }

    if (result.data?.checkoutBillingAddressUpdate?.errors?.length) {
      logger.error("Failed to update billing address", {
        errors: result.data?.checkoutBillingAddressUpdate.errors,
        checkoutId,
      });

      return err(
        handleMutationErrors(result.data?.checkoutBillingAddressUpdate.errors),
      );
    }

    return ok({ success: true });
  };
