import {
  CheckoutCompleteMutationDocument,
  type CheckoutCompleteMutationVariables,
  CheckoutShippingAddressDocument,
  type CheckoutShippingAddressVariables,
} from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";

class CheckoutService {
  async getShippingAddress(
    variables: CheckoutShippingAddressVariables,
    token?: string | null,
  ) {
    return executeGraphQL(
      CheckoutShippingAddressDocument,
      "CheckoutShippingAddressQuery",
      variables,
      token,
    );
  }

  async completeCheckout(
    variables: CheckoutCompleteMutationVariables,
    token?: string | null,
  ) {
    return executeGraphQL(
      CheckoutCompleteMutationDocument,
      "CheckoutCompleteMutation",
      variables,
      token,
    );
  }
}

export const checkoutService = new CheckoutService();
