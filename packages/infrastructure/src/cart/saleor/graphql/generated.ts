import type * as Types from "@nimara/codegen/schema";

import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export type CartCreateMutation_checkoutCreate_CheckoutCreate_checkout_Checkout =
  { id: string };

export type CartCreateMutation_checkoutCreate_CheckoutCreate_errors_CheckoutError =
  {
    addressType: Types.AddressTypeEnum | null;
    code: Types.CheckoutErrorCode;
    field: string | null;
    lines: Array<string> | null;
    message: string | null;
    variants: Array<string> | null;
  };

export type CartCreateMutation_checkoutCreate_CheckoutCreate = {
  checkout: CartCreateMutation_checkoutCreate_CheckoutCreate_checkout_Checkout | null;
  errors: Array<CartCreateMutation_checkoutCreate_CheckoutCreate_errors_CheckoutError>;
};

export type CartCreateMutation_Mutation = {
  checkoutCreate: CartCreateMutation_checkoutCreate_CheckoutCreate | null;
};

export type CartCreateMutationVariables = Types.Exact<{
  input: Types.CheckoutCreateInput;
}>;

export type CartCreateMutation = CartCreateMutation_Mutation;

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>["__apiType"];

  constructor(
    private value: string,
    public __meta__?: Record<string, any>,
  ) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
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
}`) as unknown as TypedDocumentString<
  CartCreateMutation,
  CartCreateMutationVariables
>;
