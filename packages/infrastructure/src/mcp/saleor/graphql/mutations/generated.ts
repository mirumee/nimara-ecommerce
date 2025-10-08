import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_user_User_addresses_Address = { phone: string | null };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_user_User = { firstName: string, lastName: string, email: string, addresses: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_user_User_addresses_Address> };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant = { id: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine = { id: string, quantity: number, variant: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingMethods_ShippingMethod = { id: string, name: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney_gross_Money = { amount: number };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney_net_Money = { amount: number };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney_tax_Money = { amount: number };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney = { currency: string, gross: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney_gross_Money, net: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney_net_Money, tax: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney_tax_Money };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout = { id: string, chargeStatus: Types.CheckoutChargeStatusEnum, user: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_user_User | null, lines: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine>, shippingMethods: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingMethods_ShippingMethod>, totalPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_errors_CheckoutError = { field: string | null, message: string | null, code: Types.CheckoutErrorCode, variants: Array<string> | null, lines: Array<string> | null, addressType: Types.AddressTypeEnum | null };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate = { checkout: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout | null, errors: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_errors_CheckoutError> };

export type CheckoutSessionCreate_Mutation = { checkoutCreate: CheckoutSessionCreate_checkoutCreate_CheckoutCreate | null };


export type CheckoutSessionCreateVariables = Types.Exact<{
  input: Types.CheckoutCreateInput;
}>;


export type CheckoutSessionCreate = CheckoutSessionCreate_Mutation;

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

export const CheckoutSessionCreateDocument = new TypedDocumentString(`
    mutation CheckoutSessionCreate($input: CheckoutCreateInput!) {
  checkoutCreate(input: $input) {
    checkout {
      ...CheckoutSessionFragment
    }
    errors {
      field
      message
      code
      variants
      lines
      addressType
    }
  }
}
    fragment CheckoutSessionFragment on Checkout {
  id
  chargeStatus
  user {
    firstName
    lastName
    email
    addresses {
      phone
    }
  }
  lines {
    id
    quantity
    variant {
      id
    }
  }
  shippingMethods {
    id
    name
  }
  totalPrice {
    currency
    gross {
      amount
    }
    net {
      amount
    }
    tax {
      amount
    }
  }
}`) as unknown as TypedDocumentString<CheckoutSessionCreate, CheckoutSessionCreateVariables>;