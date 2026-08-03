import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type PaymentMethodInitializeTokenizationMutation_paymentMethodInitializeTokenization_PaymentMethodInitializeTokenization_errors_PaymentMethodInitializeTokenizationError = { code: Types.PaymentMethodInitializeTokenizationErrorCode, field: string | null, message: string | null };

export type PaymentMethodInitializeTokenizationMutation_paymentMethodInitializeTokenization_PaymentMethodInitializeTokenization = { id: string | null, result: Types.PaymentMethodTokenizationResult, data: unknown | null, errors: Array<PaymentMethodInitializeTokenizationMutation_paymentMethodInitializeTokenization_PaymentMethodInitializeTokenization_errors_PaymentMethodInitializeTokenizationError> };

export type PaymentMethodInitializeTokenizationMutation_Mutation = { paymentMethodInitializeTokenization: PaymentMethodInitializeTokenizationMutation_paymentMethodInitializeTokenization_PaymentMethodInitializeTokenization | null };


export type PaymentMethodInitializeTokenizationMutationVariables = Types.Exact<{
  gatewayAppId: Types.Scalars['String']['input'];
  channel: Types.Scalars['String']['input'];
  data?: Types.InputMaybe<Types.Scalars['JSON']['input']>;
}>;


export type PaymentMethodInitializeTokenizationMutation = PaymentMethodInitializeTokenizationMutation_Mutation;

export type PaymentMethodProcessTokenizationMutation_paymentMethodProcessTokenization_PaymentMethodProcessTokenization_errors_PaymentMethodProcessTokenizationError = { code: Types.PaymentMethodProcessTokenizationErrorCode, field: string | null, message: string | null };

export type PaymentMethodProcessTokenizationMutation_paymentMethodProcessTokenization_PaymentMethodProcessTokenization = { id: string | null, result: Types.PaymentMethodTokenizationResult, data: unknown | null, errors: Array<PaymentMethodProcessTokenizationMutation_paymentMethodProcessTokenization_PaymentMethodProcessTokenization_errors_PaymentMethodProcessTokenizationError> };

export type PaymentMethodProcessTokenizationMutation_Mutation = { paymentMethodProcessTokenization: PaymentMethodProcessTokenizationMutation_paymentMethodProcessTokenization_PaymentMethodProcessTokenization | null };


export type PaymentMethodProcessTokenizationMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  channel: Types.Scalars['String']['input'];
  data?: Types.InputMaybe<Types.Scalars['JSON']['input']>;
}>;


export type PaymentMethodProcessTokenizationMutation = PaymentMethodProcessTokenizationMutation_Mutation;

export type StoredPaymentMethodRequestDeleteMutation_storedPaymentMethodRequestDelete_StoredPaymentMethodRequestDelete_errors_PaymentMethodRequestDeleteError = { code: Types.StoredPaymentMethodRequestDeleteErrorCode, field: string | null, message: string | null };

export type StoredPaymentMethodRequestDeleteMutation_storedPaymentMethodRequestDelete_StoredPaymentMethodRequestDelete = { result: Types.StoredPaymentMethodRequestDeleteResult, errors: Array<StoredPaymentMethodRequestDeleteMutation_storedPaymentMethodRequestDelete_StoredPaymentMethodRequestDelete_errors_PaymentMethodRequestDeleteError> };

export type StoredPaymentMethodRequestDeleteMutation_Mutation = { storedPaymentMethodRequestDelete: StoredPaymentMethodRequestDeleteMutation_storedPaymentMethodRequestDelete_StoredPaymentMethodRequestDelete | null };


export type StoredPaymentMethodRequestDeleteMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  channel: Types.Scalars['String']['input'];
}>;


export type StoredPaymentMethodRequestDeleteMutation = StoredPaymentMethodRequestDeleteMutation_Mutation;

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

export const PaymentMethodInitializeTokenizationMutationDocument = new TypedDocumentString(`
    mutation PaymentMethodInitializeTokenizationMutation($gatewayAppId: String!, $channel: String!, $data: JSON) {
  paymentMethodInitializeTokenization(
    id: $gatewayAppId
    channel: $channel
    data: $data
    paymentFlowToSupport: INTERACTIVE
  ) {
    id
    result
    data
    errors {
      code
      field
      message
    }
  }
}
    `) as unknown as TypedDocumentString<PaymentMethodInitializeTokenizationMutation, PaymentMethodInitializeTokenizationMutationVariables>;
export const PaymentMethodProcessTokenizationMutationDocument = new TypedDocumentString(`
    mutation PaymentMethodProcessTokenizationMutation($id: String!, $channel: String!, $data: JSON) {
  paymentMethodProcessTokenization(id: $id, channel: $channel, data: $data) {
    id
    result
    data
    errors {
      code
      field
      message
    }
  }
}
    `) as unknown as TypedDocumentString<PaymentMethodProcessTokenizationMutation, PaymentMethodProcessTokenizationMutationVariables>;
export const StoredPaymentMethodRequestDeleteMutationDocument = new TypedDocumentString(`
    mutation StoredPaymentMethodRequestDeleteMutation($id: ID!, $channel: String!) {
  storedPaymentMethodRequestDelete(id: $id, channel: $channel) {
    result
    errors {
      code
      field
      message
    }
  }
}
    `) as unknown as TypedDocumentString<StoredPaymentMethodRequestDeleteMutation, StoredPaymentMethodRequestDeleteMutationVariables>;