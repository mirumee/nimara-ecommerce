import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CheckoutErrorFragment = { addressType: Types.AddressTypeEnum | null, code: Types.CheckoutErrorCode, field: string | null, lines: Array<string> | null, message: string | null, variants: Array<string> | null };

export type CheckoutFragment_Checkout_discount_Money = { amount: number, currency: string };

export type CheckoutFragment_Checkout_shippingMethods_ShippingMethod_price_Money = { amount: number, currency: string };

export type CheckoutFragment_Checkout_shippingMethods_ShippingMethod = { id: string, name: string, price: CheckoutFragment_Checkout_shippingMethods_ShippingMethod_price_Money };

export type CheckoutFragment_Checkout_shippingAddress_Address_country_CountryDisplay = { country: string, code: string };

export type CheckoutFragment_Checkout_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: CheckoutFragment_Checkout_shippingAddress_Address_country_CountryDisplay };

export type CheckoutFragment_Checkout_billingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: CheckoutFragment_Checkout_shippingAddress_Address_country_CountryDisplay };

export type CheckoutFragment_Checkout_deliveryMethod_ShippingMethod_Warehouse = (
  { id: string, name: string }
  & { __typename: 'ShippingMethod' | 'Warehouse' }
);

export type CheckoutFragment_Checkout_availablePaymentGateways_PaymentGateway_config_GatewayConfigLine = { field: string, value: string | null };

export type CheckoutFragment_Checkout_availablePaymentGateways_PaymentGateway = { name: string, id: string, config: Array<CheckoutFragment_Checkout_availablePaymentGateways_PaymentGateway_config_GatewayConfigLine> };

export type CheckoutFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type CheckoutFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CheckoutFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney = { net: CheckoutFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_net_Money, gross: CheckoutFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_gross_Money };

export type CheckoutFragment_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money = { amount: number, currency: string };

export type CheckoutFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation = { name: string };

export type CheckoutFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia = { url: string, alt: string };

export type CheckoutFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image = { alt: string | null, url: string };

export type CheckoutFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation = { name: string | null };

export type CheckoutFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product = { id: string, slug: string, name: string, thumbnail: CheckoutFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image | null, translation: CheckoutFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation | null };

export type CheckoutFragment_Checkout_lines_CheckoutLine_variant_ProductVariant = { id: string, quantityAvailable: number | null, quantityLimitPerCustomer: number | null, name: string, sku: string | null, translation: CheckoutFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation | null, media: Array<CheckoutFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia> | null, product: CheckoutFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product };

export type CheckoutFragment_Checkout_lines_CheckoutLine = { id: string, quantity: number, totalPrice: CheckoutFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CheckoutFragment_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CheckoutFragment_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutFragment_Checkout_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type CheckoutFragment_Checkout_totalPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CheckoutFragment_Checkout_totalPrice_TaxedMoney_tax_Money = { currency: string, amount: number };

export type CheckoutFragment_Checkout_totalPrice_TaxedMoney = { net: CheckoutFragment_Checkout_totalPrice_TaxedMoney_net_Money, gross: CheckoutFragment_Checkout_totalPrice_TaxedMoney_gross_Money, tax: CheckoutFragment_Checkout_totalPrice_TaxedMoney_tax_Money };

export type CheckoutFragment_Checkout_subtotalPrice_TaxedMoney = { net: CheckoutFragment_Checkout_totalPrice_TaxedMoney_net_Money, gross: CheckoutFragment_Checkout_totalPrice_TaxedMoney_gross_Money, tax: CheckoutFragment_Checkout_totalPrice_TaxedMoney_tax_Money };

export type CheckoutFragment_Checkout_shippingPrice_TaxedMoney = { net: CheckoutFragment_Checkout_totalPrice_TaxedMoney_net_Money, gross: CheckoutFragment_Checkout_totalPrice_TaxedMoney_gross_Money, tax: CheckoutFragment_Checkout_totalPrice_TaxedMoney_tax_Money };

export type CheckoutFragment_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine = { id: string, quantity: number, totalPrice: CheckoutFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CheckoutFragment_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CheckoutFragment_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutFragment_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine = { id: string, quantity: number, totalPrice: CheckoutFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CheckoutFragment_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CheckoutFragment_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutFragment_Checkout_problems_CheckoutLineProblemInsufficientStock = (
  { availableQuantity: number | null, line: CheckoutFragment_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemInsufficientStock' }
);

export type CheckoutFragment_Checkout_problems_CheckoutLineProblemVariantNotAvailable = (
  { line: CheckoutFragment_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemVariantNotAvailable' }
);

export type CheckoutFragment_Checkout_problems = CheckoutFragment_Checkout_problems_CheckoutLineProblemInsufficientStock | CheckoutFragment_Checkout_problems_CheckoutLineProblemVariantNotAvailable;

export type CheckoutFragment = { id: string, email: string | null, displayGrossPrices: boolean, voucherCode: string | null, authorizeStatus: Types.CheckoutAuthorizeStatusEnum, chargeStatus: Types.CheckoutChargeStatusEnum, discount: CheckoutFragment_Checkout_discount_Money | null, shippingMethods: Array<CheckoutFragment_Checkout_shippingMethods_ShippingMethod>, shippingAddress: CheckoutFragment_Checkout_shippingAddress_Address | null, billingAddress: CheckoutFragment_Checkout_billingAddress_Address | null, deliveryMethod: CheckoutFragment_Checkout_deliveryMethod_ShippingMethod_Warehouse | null, availablePaymentGateways: Array<CheckoutFragment_Checkout_availablePaymentGateways_PaymentGateway>, lines: Array<CheckoutFragment_Checkout_lines_CheckoutLine>, totalPrice: CheckoutFragment_Checkout_totalPrice_TaxedMoney, subtotalPrice: CheckoutFragment_Checkout_subtotalPrice_TaxedMoney, shippingPrice: CheckoutFragment_Checkout_shippingPrice_TaxedMoney, problems: Array<CheckoutFragment_Checkout_problems> | null };

export type CheckoutProblemsFragment_CheckoutLineProblemInsufficientStock = (
  { availableQuantity: number | null, line: CheckoutFragment_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemInsufficientStock' }
);

export type CheckoutProblemsFragment_CheckoutLineProblemVariantNotAvailable = (
  { line: CheckoutFragment_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemVariantNotAvailable' }
);

export type CheckoutProblemsFragment = CheckoutProblemsFragment_CheckoutLineProblemInsufficientStock | CheckoutProblemsFragment_CheckoutLineProblemVariantNotAvailable;

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
export const CheckoutErrorFragment = new TypedDocumentString(`
    fragment CheckoutErrorFragment on CheckoutError {
  addressType
  code
  field
  lines
  message
  variants
}
    `, {"fragmentName":"CheckoutErrorFragment"}) as unknown as TypedDocumentString<CheckoutErrorFragment, unknown>;
export const CheckoutFragment = new TypedDocumentString(`
    fragment CheckoutFragment on Checkout {
  id
  email
  displayGrossPrices
  discount {
    amount
    currency
  }
  voucherCode
  shippingMethods {
    id
    name
    price {
      amount
      currency
    }
  }
  shippingAddress {
    ...AddressFragment
  }
  billingAddress {
    ...AddressFragment
  }
  deliveryMethod {
    __typename
    ... on Warehouse {
      id
      name
    }
    ... on ShippingMethod {
      id
      name
    }
  }
  availablePaymentGateways {
    name
    id
    config {
      field
      value
    }
  }
  lines {
    ...CartLineFragment
  }
  totalPrice {
    ...TaxedMoneyFragment
  }
  subtotalPrice {
    ...TaxedMoneyFragment
  }
  shippingPrice {
    ...TaxedMoneyFragment
  }
  authorizeStatus
  chargeStatus
  problems {
    ...CheckoutProblemsFragment
  }
}
    fragment CheckoutProblemsFragment on CheckoutProblem {
  ... on CheckoutLineProblemInsufficientStock {
    __typename
    availableQuantity
    line {
      ...CartLineFragment
    }
  }
  ... on CheckoutLineProblemVariantNotAvailable {
    __typename
    line {
      ...CartLineFragment
    }
  }
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
}
fragment CartLineFragment on CheckoutLine {
  id
  quantity
  totalPrice {
    net {
      ...MoneyFragment
    }
    gross {
      ...MoneyFragment
    }
  }
  undiscountedTotalPrice {
    amount
    currency
  }
  variant {
    id
    quantityAvailable(countryCode: $countryCode)
    quantityLimitPerCustomer
    name
    sku
    translation(languageCode: $languageCode) {
      name
    }
    media {
      url(size: $thumbnailSize, format: $thumbnailFormat)
      alt
    }
    product {
      id
      slug
      thumbnail(size: $thumbnailSize, format: $thumbnailFormat) {
        alt
        url
      }
      name
      translation(languageCode: $languageCode) {
        name
      }
    }
  }
}
fragment MoneyFragment on Money {
  currency
  amount
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
}`, {"fragmentName":"CheckoutFragment"}) as unknown as TypedDocumentString<CheckoutFragment, unknown>;