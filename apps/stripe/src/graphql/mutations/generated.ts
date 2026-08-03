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
  paymentMethodDetails?: Types.InputMaybe<Types.PaymentMethodDetailsInput>;
}>;


export type TransactionEventReportMutation = TransactionEventReportMutation_Mutation;

export type UserPrivateMetadataUpdateMutation_updatePrivateMetadata_UpdatePrivateMetadata_errors_MetadataError = { code: Types.MetadataErrorCode, field: string | null, message: string | null };

export type UserPrivateMetadataUpdateMutation_updatePrivateMetadata_UpdatePrivateMetadata = { errors: Array<UserPrivateMetadataUpdateMutation_updatePrivateMetadata_UpdatePrivateMetadata_errors_MetadataError> };

export type UserPrivateMetadataUpdateMutation_Mutation = { updatePrivateMetadata: UserPrivateMetadataUpdateMutation_updatePrivateMetadata_UpdatePrivateMetadata | null };


export type UserPrivateMetadataUpdateMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  input: Array<Types.MetadataInput> | Types.MetadataInput;
}>;


export type UserPrivateMetadataUpdateMutation = UserPrivateMetadataUpdateMutation_Mutation;

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

export const TransactionEventReportMutationDocument = new TypedDocumentString(`
    mutation TransactionEventReportMutation($transactionId: ID!, $amount: PositiveDecimal!, $availableActions: [TransactionActionEnum!]!, $externalUrl: String!, $message: String, $pspReference: String!, $time: DateTime!, $type: TransactionEventTypeEnum!, $paymentMethodDetails: PaymentMethodDetailsInput) {
  transactionEventReport(
    id: $transactionId
    amount: $amount
    availableActions: $availableActions
    externalUrl: $externalUrl
    message: $message
    pspReference: $pspReference
    time: $time
    type: $type
    paymentMethodDetails: $paymentMethodDetails
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
export const UserPrivateMetadataUpdateMutationDocument = new TypedDocumentString(`
    mutation UserPrivateMetadataUpdateMutation($id: ID!, $input: [MetadataInput!]!) {
  updatePrivateMetadata(id: $id, input: $input) {
    errors {
      code
      field
      message
    }
  }
}
    `) as unknown as TypedDocumentString<UserPrivateMetadataUpdateMutation, UserPrivateMetadataUpdateMutationVariables>;