import {
  CheckoutCompleteMutationDocument,
  type CheckoutCompleteMutationVariables,
} from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";

class CheckoutService {
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
