import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CheckoutQuery_checkout_Checkout_lines_CheckoutLine = { id: string, quantity: number };

export type CheckoutQuery_checkout_Checkout = { id: string, lines: Array<CheckoutQuery_checkout_Checkout_lines_CheckoutLine> };

export type CheckoutQuery_Query = { checkout: CheckoutQuery_checkout_Checkout | null };


export type CheckoutQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type CheckoutQuery = CheckoutQuery_Query;

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

export const CheckoutQueryDocument = new TypedDocumentString(`
    query CheckoutQuery($id: ID!) {
  checkout(id: $id) {
    ...CheckoutSession
  }
}
    fragment CheckoutSession on Checkout {
  id
  lines {
    id
    quantity
  }
}`) as unknown as TypedDocumentString<CheckoutQuery, CheckoutQueryVariables>;