import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_user_User = { firstName: string, lastName: string, email: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_deliveryMethod_ShippingMethod_Warehouse = (
  { id: string, name: string }
  & { __typename: 'ShippingMethod' | 'Warehouse' }
);

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant = { id: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_tax_Money = { currency: string, amount: number };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney = { net: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_net_Money, gross: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_gross_Money, tax: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_tax_Money };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney = { net: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_net_Money, gross: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_gross_Money, tax: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_tax_Money };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine = { id: string, quantity: number, variant: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant, unitPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney, totalPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_billingAddress_Address_country_CountryDisplay = { country: string, code: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_billingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_billingAddress_Address_country_CountryDisplay };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_billingAddress_Address_country_CountryDisplay };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingMethods_ShippingMethod = { id: string, name: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney = { currency: string, net: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney_net_Money, gross: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney_net_Money, tax: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney_net_Money };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_subtotalPrice_TaxedMoney = { currency: string, net: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_net_Money, gross: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_gross_Money, tax: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_tax_Money };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingPrice_TaxedMoney = { net: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_net_Money, gross: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_gross_Money, tax: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_tax_Money };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_discount_Money = { currency: string, amount: number };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout = { id: string, chargeStatus: Types.CheckoutChargeStatusEnum, authorizeStatus: Types.CheckoutAuthorizeStatusEnum, user: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_user_User | null, deliveryMethod: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_deliveryMethod_ShippingMethod_Warehouse | null, lines: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine>, billingAddress: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_billingAddress_Address | null, shippingAddress: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingAddress_Address | null, shippingMethods: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingMethods_ShippingMethod>, totalPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney, subtotalPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_subtotalPrice_TaxedMoney, shippingPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingPrice_TaxedMoney, discount: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_discount_Money | null };

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
  authorizeStatus
  user {
    firstName
    lastName
    email
  }
  deliveryMethod {
    __typename
    ... on ShippingMethod {
      id
      name
    }
    ... on Warehouse {
      id
      name
    }
  }
  lines {
    id
    quantity
    variant {
      id
    }
    unitPrice {
      ...TaxedMoneyFragment
    }
    totalPrice {
      ...TaxedMoneyFragment
    }
  }
  billingAddress {
    ...AddressFragment
  }
  shippingAddress {
    ...AddressFragment
  }
  shippingMethods {
    id
    name
  }
  totalPrice {
    currency
    ...TaxedMoneyFragment
  }
  subtotalPrice {
    currency
    ...TaxedMoneyFragment
  }
  shippingPrice {
    ...TaxedMoneyFragment
  }
  discount {
    ...MoneyFragment
  }
  totalPrice {
    ...TaxedMoneyFragment
  }
}
fragment TaxedMoneyFragment on TaxedMoney {
  net {
    ...MoneyFragment
  }
  gross {
    ...MoneyFragment
  }
  tax {
    ...MoneyFragment
  }
}
fragment MoneyFragment on Money {
  currency
  amount
}
fragment AddressFragment on Address {
  id
  city
  phone
  postalCode
  companyName
  cityArea
  streetAddress1
  streetAddress2
  countryArea
  country {
    country
    code
  }
  firstName
  lastName
  isDefaultShippingAddress
  isDefaultBillingAddress
}`) as unknown as TypedDocumentString<CheckoutSessionCreate, CheckoutSessionCreateVariables>;