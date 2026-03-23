import {
  CheckoutTransactionsDocument,
  type CheckoutTransactionsVariables,
  TransactionCreateDocument,
  type TransactionCreateVariables,
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
    variables?: TransactionCreateVariables,
    token?: string | null,
  ) {
    return executeGraphQL(
      TransactionCreateDocument,
      "CreateTransactionMutation",
      variables,
      token,
    );
  }
}

export const transactionsService = new TransactionsService();
