import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CheckoutCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine = { id: string, quantity: number };

export type CheckoutCreate_checkoutCreate_CheckoutCreate_checkout_Checkout = { id: string, lines: Array<CheckoutCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine> };

export type CheckoutCreate_checkoutCreate_CheckoutCreate_errors_CheckoutError = { field: string | null, message: string | null };

export type CheckoutCreate_checkoutCreate_CheckoutCreate = { checkout: CheckoutCreate_checkoutCreate_CheckoutCreate_checkout_Checkout | null, errors: Array<CheckoutCreate_checkoutCreate_CheckoutCreate_errors_CheckoutError> };

export type CheckoutCreate_Mutation = { checkoutCreate: CheckoutCreate_checkoutCreate_CheckoutCreate | null };


export type CheckoutCreateVariables = Types.Exact<{
  input: Types.CheckoutCreateInput;
}>;


export type CheckoutCreate = CheckoutCreate_Mutation;

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

export const CheckoutCreateDocument = new TypedDocumentString(`
    mutation CheckoutCreate($input: CheckoutCreateInput!) {
  checkoutCreate(input: $input) {
    checkout {
      ...CheckoutSession
    }
    errors {
      field
      message
    }
  }
}
    fragment CheckoutSession on Checkout {
  id
  lines {
    id
    quantity
  }
}`) as unknown as TypedDocumentString<CheckoutCreate, CheckoutCreateVariables>;