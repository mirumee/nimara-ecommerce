import type { BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";

import { CheckoutDeliveryMethodUpdateMutationDocument } from "../graphql/mutations/generated";
import type {
  CheckoutDeliveryMethodOptions,
  CheckoutDeliveryMethodUpdateInfra,
  SaleorCheckoutServiceConfig,
} from "../types";

export const saleorDeliveryMethodUpdateInfra = ({
  apiURL,
}: SaleorCheckoutServiceConfig): CheckoutDeliveryMethodUpdateInfra => {
  return async ({
    checkout,
    deliveryMethodId,
  }: CheckoutDeliveryMethodOptions) => {
    const { data, error } = await graphqlClient(apiURL).execute(
      CheckoutDeliveryMethodUpdateMutationDocument,
      {
        variables: {
          checkoutId: checkout.id,
          deliveryMethodId,
        },
      },
    );

    if (error) {
      return {
        isSuccess: false,
        serverError: error as BaseError,
      };
    }

    if (data?.checkoutDeliveryMethodUpdate?.errors?.length) {
      return {
        isSuccess: false,
        validationErrors: data?.checkoutDeliveryMethodUpdate?.errors,
      };
    }

    return {
      isSuccess: true,
    };
  };
};
