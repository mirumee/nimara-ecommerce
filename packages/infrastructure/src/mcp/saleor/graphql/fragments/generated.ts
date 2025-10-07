import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CheckoutSession_Checkout_lines_CheckoutLine = { id: string, quantity: number };

export type CheckoutSession = { id: string, lines: Array<CheckoutSession_Checkout_lines_CheckoutLine> };

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
export const CheckoutSession = new TypedDocumentString(`
    fragment CheckoutSession on Checkout {
  id
  lines {
    id
    quantity
  }
}
    `, {"fragmentName":"CheckoutSession"}) as unknown as TypedDocumentString<CheckoutSession, unknown>;