import {
  CheckoutTransactionsDocument,
  type CheckoutTransactionsVariables,
  TransactionCreateMutationDocument,
  type TransactionCreateMutationVariables,
} from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";

class TransactionsService {
  async getCheckoutTransactions(
    variables: CheckoutTransactionsVariables,
    token?: string | null,
  ) {
    return executeGraphQL(
      CheckoutTransactionsDocument,
      "CheckoutTransactionsQuery",
      variables,
      token,
    );
  }

  async createTransaction(
    variables?: TransactionCreateMutationVariables,
    token?: string | null,
  ) {
    return executeGraphQL(
      TransactionCreateMutationDocument,
      "CreateTransactionMutation",
      variables,
      token,
    );
  }
}

export const transactionsService = new TransactionsService();
