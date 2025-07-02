import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type FulfillmentReturnProducts_orderFulfillmentReturnProducts_FulfillmentReturnProducts_returnFulfillment_Fulfillment = { status: Types.FulfillmentStatus };

export type FulfillmentReturnProducts_orderFulfillmentReturnProducts_FulfillmentReturnProducts_errors_OrderError = { field: string | null, message: string | null, code: Types.OrderErrorCode };

export type FulfillmentReturnProducts_orderFulfillmentReturnProducts_FulfillmentReturnProducts = { returnFulfillment: FulfillmentReturnProducts_orderFulfillmentReturnProducts_FulfillmentReturnProducts_returnFulfillment_Fulfillment | null, errors: Array<FulfillmentReturnProducts_orderFulfillmentReturnProducts_FulfillmentReturnProducts_errors_OrderError> };

export type FulfillmentReturnProducts_Mutation = { orderFulfillmentReturnProducts: FulfillmentReturnProducts_orderFulfillmentReturnProducts_FulfillmentReturnProducts | null };


export type FulfillmentReturnProductsVariables = Types.Exact<{
  order: Types.Scalars['ID']['input'];
  input: Types.OrderReturnProductsInput;
}>;


export type FulfillmentReturnProducts = FulfillmentReturnProducts_Mutation;

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

export const FulfillmentReturnProductsDocument = new TypedDocumentString(`
    mutation FulfillmentReturnProducts($order: ID!, $input: OrderReturnProductsInput!) {
  orderFulfillmentReturnProducts(order: $order, input: $input) {
    returnFulfillment {
      status
    }
    errors {
      field
      message
      code
    }
  }
}
    `) as unknown as TypedDocumentString<FulfillmentReturnProducts, FulfillmentReturnProductsVariables>;