import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type TransactionEventReportMutation_transactionEventReport_TransactionEventReport_errors_TransactionEventReportError = { field: string | null, message: string | null, code: Types.TransactionEventReportErrorCode };

export type TransactionEventReportMutation_transactionEventReport_TransactionEventReport = { alreadyProcessed: boolean | null, errors: Array<TransactionEventReportMutation_transactionEventReport_TransactionEventReport_errors_TransactionEventReportError> };

export type TransactionEventReportMutation_Mutation = { transactionEventReport: TransactionEventReportMutation_transactionEventReport_TransactionEventReport | null };


export type TransactionEventReportMutationVariables = Types.Exact<{
  transactionId: Types.Scalars['ID']['input'];
  amount: Types.Scalars['PositiveDecimal']['input'];
  availableActions: Array<Types.TransactionActionEnum> | Types.TransactionActionEnum;
  externalUrl: Types.Scalars['String']['input'];
  message?: Types.InputMaybe<Types.Scalars['String']['input']>;
  pspReference: Types.Scalars['String']['input'];
  time: Types.Scalars['DateTime']['input'];
  type: Types.TransactionEventTypeEnum;
}>;


export type TransactionEventReportMutation = TransactionEventReportMutation_Mutation;

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];

  constructor(private value: string, public __meta__?: Record<string, any>) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const TransactionEventReportMutationDocument = new TypedDocumentString(`
    mutation TransactionEventReportMutation($transactionId: ID!, $amount: PositiveDecimal!, $availableActions: [TransactionActionEnum!]!, $externalUrl: String!, $message: String, $pspReference: String!, $time: DateTime!, $type: TransactionEventTypeEnum!) {
  transactionEventReport(
    id: $transactionId
    amount: $amount
    availableActions: $availableActions
    externalUrl: $externalUrl
    message: $message
    pspReference: $pspReference
    time: $time
    type: $type
  ) {
    alreadyProcessed
    errors {
      field
      message
      code
    }
  }
}
    `) as unknown as TypedDocumentString<TransactionEventReportMutation, TransactionEventReportMutationVariables>;