import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CartCreateMutation_checkoutCreate_CheckoutCreate_checkout_Checkout = { id: string };

export type CartCreateMutation_checkoutCreate_CheckoutCreate_errors_CheckoutError = { addressType: Types.AddressTypeEnum | null, code: Types.CheckoutErrorCode, field: string | null, lines: Array<string> | null, message: string | null, variants: Array<string> | null };

export type CartCreateMutation_checkoutCreate_CheckoutCreate = { checkout: CartCreateMutation_checkoutCreate_CheckoutCreate_checkout_Checkout | null, errors: Array<CartCreateMutation_checkoutCreate_CheckoutCreate_errors_CheckoutError> };

export type CartCreateMutation_Mutation = { checkoutCreate: CartCreateMutation_checkoutCreate_CheckoutCreate | null };


export type CartCreateMutationVariables = Types.Exact<{
  input: Types.CheckoutCreateInput;
}>;


export type CartCreateMutation = CartCreateMutation_Mutation;

export type CartLinesAddMutation_checkoutLinesAdd_CheckoutLinesAdd_errors_CheckoutError = { addressType: Types.AddressTypeEnum | null, code: Types.CheckoutErrorCode, field: string | null, lines: Array<string> | null, message: string | null, variants: Array<string> | null };

export type CartLinesAddMutation_checkoutLinesAdd_CheckoutLinesAdd = { errors: Array<CartLinesAddMutation_checkoutLinesAdd_CheckoutLinesAdd_errors_CheckoutError> };

export type CartLinesAddMutation_Mutation = { checkoutLinesAdd: CartLinesAddMutation_checkoutLinesAdd_CheckoutLinesAdd | null };


export type CartLinesAddMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  lines: Array<Types.CheckoutLineInput> | Types.CheckoutLineInput;
}>;


export type CartLinesAddMutation = CartLinesAddMutation_Mutation;

export type CartLinesDeleteMutation_checkoutLinesDelete_CheckoutLinesDelete_errors_CheckoutError = { addressType: Types.AddressTypeEnum | null, code: Types.CheckoutErrorCode, field: string | null, lines: Array<string> | null, message: string | null, variants: Array<string> | null };

export type CartLinesDeleteMutation_checkoutLinesDelete_CheckoutLinesDelete = { errors: Array<CartLinesDeleteMutation_checkoutLinesDelete_CheckoutLinesDelete_errors_CheckoutError> };

export type CartLinesDeleteMutation_Mutation = { checkoutLinesDelete: CartLinesDeleteMutation_checkoutLinesDelete_CheckoutLinesDelete | null };


export type CartLinesDeleteMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  linesIds: Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input'];
}>;


export type CartLinesDeleteMutation = CartLinesDeleteMutation_Mutation;

export type CartLinesUpdateMutation_checkoutLinesUpdate_CheckoutLinesUpdate_errors_CheckoutError = { addressType: Types.AddressTypeEnum | null, code: Types.CheckoutErrorCode, field: string | null, lines: Array<string> | null, message: string | null, variants: Array<string> | null };

export type CartLinesUpdateMutation_checkoutLinesUpdate_CheckoutLinesUpdate = { errors: Array<CartLinesUpdateMutation_checkoutLinesUpdate_CheckoutLinesUpdate_errors_CheckoutError> };

export type CartLinesUpdateMutation_Mutation = { checkoutLinesUpdate: CartLinesUpdateMutation_checkoutLinesUpdate_CheckoutLinesUpdate | null };


export type CartLinesUpdateMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  lines: Array<Types.CheckoutLineUpdateInput> | Types.CheckoutLineUpdateInput;
}>;


export type CartLinesUpdateMutation = CartLinesUpdateMutation_Mutation;

export type OrderCreateFromCheckoutMutation_orderCreateFromCheckout_OrderCreateFromCheckout_order_Order = { id: string };

export type OrderCreateFromCheckoutMutation_orderCreateFromCheckout_OrderCreateFromCheckout_errors_OrderCreateFromCheckoutError = { message: string | null, code: Types.OrderCreateFromCheckoutErrorCode, field: string | null };

export type OrderCreateFromCheckoutMutation_orderCreateFromCheckout_OrderCreateFromCheckout = { order: OrderCreateFromCheckoutMutation_orderCreateFromCheckout_OrderCreateFromCheckout_order_Order | null, errors: Array<OrderCreateFromCheckoutMutation_orderCreateFromCheckout_OrderCreateFromCheckout_errors_OrderCreateFromCheckoutError> };

export type OrderCreateFromCheckoutMutation_Mutation = { orderCreateFromCheckout: OrderCreateFromCheckoutMutation_orderCreateFromCheckout_OrderCreateFromCheckout | null };


export type OrderCreateFromCheckoutMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type OrderCreateFromCheckoutMutation = OrderCreateFromCheckoutMutation_Mutation;

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

export const CartCreateMutationDocument = new TypedDocumentString(`
    mutation CartCreateMutation($input: CheckoutCreateInput!) {
  checkoutCreate(input: $input) {
    checkout {
      id
    }
    errors {
      ...CheckoutErrorFragment
    }
  }
}
    fragment CheckoutErrorFragment on CheckoutError {
  addressType
  code
  field
  lines
  message
  variants
}`) as unknown as TypedDocumentString<CartCreateMutation, CartCreateMutationVariables>;
export const CartLinesAddMutationDocument = new TypedDocumentString(`
    mutation CartLinesAddMutation($id: ID!, $lines: [CheckoutLineInput!]!) {
  checkoutLinesAdd(id: $id, lines: $lines) {
    errors {
      ...CheckoutErrorFragment
    }
  }
}
    fragment CheckoutErrorFragment on CheckoutError {
  addressType
  code
  field
  lines
  message
  variants
}`) as unknown as TypedDocumentString<CartLinesAddMutation, CartLinesAddMutationVariables>;
export const CartLinesDeleteMutationDocument = new TypedDocumentString(`
    mutation CartLinesDeleteMutation($id: ID!, $linesIds: [ID!]!) {
  checkoutLinesDelete(id: $id, linesIds: $linesIds) {
    errors {
      ...CheckoutErrorFragment
    }
  }
}
    fragment CheckoutErrorFragment on CheckoutError {
  addressType
  code
  field
  lines
  message
  variants
}`) as unknown as TypedDocumentString<CartLinesDeleteMutation, CartLinesDeleteMutationVariables>;
export const CartLinesUpdateMutationDocument = new TypedDocumentString(`
    mutation CartLinesUpdateMutation($id: ID!, $lines: [CheckoutLineUpdateInput!]!) {
  checkoutLinesUpdate(id: $id, lines: $lines) {
    errors {
      ...CheckoutErrorFragment
    }
  }
}
    fragment CheckoutErrorFragment on CheckoutError {
  addressType
  code
  field
  lines
  message
  variants
}`) as unknown as TypedDocumentString<CartLinesUpdateMutation, CartLinesUpdateMutationVariables>;
export const OrderCreateFromCheckoutMutationDocument = new TypedDocumentString(`
    mutation OrderCreateFromCheckoutMutation($id: ID!) {
  orderCreateFromCheckout(id: $id) {
    order {
      id
    }
    errors {
      message
      code
      field
    }
  }
}
    `) as unknown as TypedDocumentString<OrderCreateFromCheckoutMutation, OrderCreateFromCheckoutMutationVariables>;