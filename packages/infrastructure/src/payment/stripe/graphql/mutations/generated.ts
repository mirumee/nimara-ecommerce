import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type TransactionInitializeMutation_transactionInitialize_TransactionInitialize_transaction_TransactionItem = { id: string };

export type TransactionInitializeMutation_transactionInitialize_TransactionInitialize_transactionEvent_TransactionEvent = { id: string, type: Types.TransactionEventTypeEnum | null, message: string };

export type TransactionInitializeMutation_transactionInitialize_TransactionInitialize_errors_TransactionInitializeError = { field: string | null, message: string | null, code: Types.TransactionInitializeErrorCode };

export type TransactionInitializeMutation_transactionInitialize_TransactionInitialize = { data: unknown | null, transaction: TransactionInitializeMutation_transactionInitialize_TransactionInitialize_transaction_TransactionItem | null, transactionEvent: TransactionInitializeMutation_transactionInitialize_TransactionInitialize_transactionEvent_TransactionEvent | null, errors: Array<TransactionInitializeMutation_transactionInitialize_TransactionInitialize_errors_TransactionInitializeError> };

export type TransactionInitializeMutation_Mutation = { transactionInitialize: TransactionInitializeMutation_transactionInitialize_TransactionInitialize | null };


export type TransactionInitializeMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  data?: Types.InputMaybe<Types.Scalars['JSON']['input']>;
  amount?: Types.InputMaybe<Types.Scalars['PositiveDecimal']['input']>;
  gatewayAppId: Types.Scalars['String']['input'];
}>;


export type TransactionInitializeMutation = TransactionInitializeMutation_Mutation;

export type TransactionProcessMutation_transactionProcess_TransactionProcess_transaction_TransactionItem_order_Order = { id: string };

export type TransactionProcessMutation_transactionProcess_TransactionProcess_transaction_TransactionItem = { id: string, order: TransactionProcessMutation_transactionProcess_TransactionProcess_transaction_TransactionItem_order_Order | null };

export type TransactionProcessMutation_transactionProcess_TransactionProcess_transactionEvent_TransactionEvent = { id: string, type: Types.TransactionEventTypeEnum | null, message: string };

export type TransactionProcessMutation_transactionProcess_TransactionProcess_errors_TransactionProcessError = { field: string | null, message: string | null, code: Types.TransactionProcessErrorCode };

export type TransactionProcessMutation_transactionProcess_TransactionProcess = { data: unknown | null, transaction: TransactionProcessMutation_transactionProcess_TransactionProcess_transaction_TransactionItem | null, transactionEvent: TransactionProcessMutation_transactionProcess_TransactionProcess_transactionEvent_TransactionEvent | null, errors: Array<TransactionProcessMutation_transactionProcess_TransactionProcess_errors_TransactionProcessError> };

export type TransactionProcessMutation_Mutation = { transactionProcess: TransactionProcessMutation_transactionProcess_TransactionProcess | null };


export type TransactionProcessMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  data?: Types.InputMaybe<Types.Scalars['JSON']['input']>;
}>;


export type TransactionProcessMutation = TransactionProcessMutation_Mutation;

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const TransactionInitializeMutationDocument = new TypedDocumentString(`
    mutation TransactionInitializeMutation($id: ID!, $data: JSON, $amount: PositiveDecimal, $gatewayAppId: String!) {
  transactionInitialize(
    id: $id
    amount: $amount
    paymentGateway: {id: $gatewayAppId, data: $data}
  ) {
    transaction {
      id
    }
    transactionEvent {
      id
      type
      message
    }
    data
    errors {
      field
      message
      code
    }
  }
}
    `) as unknown as TypedDocumentString<TransactionInitializeMutation, TransactionInitializeMutationVariables>;
export const TransactionProcessMutationDocument = new TypedDocumentString(`
    mutation TransactionProcessMutation($id: ID!, $data: JSON) {
  transactionProcess(id: $id, data: $data) {
    transaction {
      id
      order {
        id
      }
    }
    transactionEvent {
      id
      type
      message
    }
    data
    errors {
      field
      message
      code
    }
  }
}
    `) as unknown as TypedDocumentString<TransactionProcessMutation, TransactionProcessMutationVariables>;