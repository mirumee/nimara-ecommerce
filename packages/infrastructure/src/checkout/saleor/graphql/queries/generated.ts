import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CheckoutFindQuery_checkout_Checkout_discount_Money = { amount: number, currency: string };

export type CheckoutFindQuery_checkout_Checkout_shippingMethods_ShippingMethod_price_Money = { amount: number, currency: string };

export type CheckoutFindQuery_checkout_Checkout_shippingMethods_ShippingMethod = { id: string, name: string, price: CheckoutFindQuery_checkout_Checkout_shippingMethods_ShippingMethod_price_Money };

export type CheckoutFindQuery_checkout_Checkout_shippingAddress_Address_country_CountryDisplay = { country: string, code: string };

export type CheckoutFindQuery_checkout_Checkout_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: CheckoutFindQuery_checkout_Checkout_shippingAddress_Address_country_CountryDisplay };

export type CheckoutFindQuery_checkout_Checkout_billingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: CheckoutFindQuery_checkout_Checkout_shippingAddress_Address_country_CountryDisplay };

export type CheckoutFindQuery_checkout_Checkout_deliveryMethod_ShippingMethod_Warehouse = (
  { id: string, name: string }
  & { __typename: 'ShippingMethod' | 'Warehouse' }
);

export type CheckoutFindQuery_checkout_Checkout_availablePaymentGateways_PaymentGateway_config_GatewayConfigLine = { field: string, value: string | null };

export type CheckoutFindQuery_checkout_Checkout_availablePaymentGateways_PaymentGateway = { name: string, id: string, config: Array<CheckoutFindQuery_checkout_Checkout_availablePaymentGateways_PaymentGateway_config_GatewayConfigLine> };

export type CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney = { net: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_net_Money, gross: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_gross_Money };

export type CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money = { amount: number, currency: string };

export type CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation = { name: string };

export type CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia = { url: string, alt: string };

export type CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image = { alt: string | null, url: string };

export type CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation = { name: string | null };

export type CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product = { id: string, slug: string, name: string, thumbnail: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image | null, translation: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation | null };

export type CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant = { id: string, quantityAvailable: number | null, quantityLimitPerCustomer: number | null, name: string, sku: string | null, translation: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation | null, media: Array<CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia> | null, product: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product };

export type CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine = { id: string, quantity: number, totalPrice: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutFindQuery_checkout_Checkout_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type CheckoutFindQuery_checkout_Checkout_totalPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CheckoutFindQuery_checkout_Checkout_totalPrice_TaxedMoney_tax_Money = { currency: string, amount: number };

export type CheckoutFindQuery_checkout_Checkout_totalPrice_TaxedMoney = { net: CheckoutFindQuery_checkout_Checkout_totalPrice_TaxedMoney_net_Money, gross: CheckoutFindQuery_checkout_Checkout_totalPrice_TaxedMoney_gross_Money, tax: CheckoutFindQuery_checkout_Checkout_totalPrice_TaxedMoney_tax_Money };

export type CheckoutFindQuery_checkout_Checkout_subtotalPrice_TaxedMoney = { net: CheckoutFindQuery_checkout_Checkout_totalPrice_TaxedMoney_net_Money, gross: CheckoutFindQuery_checkout_Checkout_totalPrice_TaxedMoney_gross_Money, tax: CheckoutFindQuery_checkout_Checkout_totalPrice_TaxedMoney_tax_Money };

export type CheckoutFindQuery_checkout_Checkout_shippingPrice_TaxedMoney = { net: CheckoutFindQuery_checkout_Checkout_totalPrice_TaxedMoney_net_Money, gross: CheckoutFindQuery_checkout_Checkout_totalPrice_TaxedMoney_gross_Money, tax: CheckoutFindQuery_checkout_Checkout_totalPrice_TaxedMoney_tax_Money };

export type CheckoutFindQuery_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine = { id: string, quantity: number, totalPrice: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutFindQuery_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine = { id: string, quantity: number, totalPrice: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutFindQuery_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock = (
  { availableQuantity: number | null, line: CheckoutFindQuery_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemInsufficientStock' }
);

export type CheckoutFindQuery_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable = (
  { line: CheckoutFindQuery_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemVariantNotAvailable' }
);

export type CheckoutFindQuery_checkout_Checkout_problems = CheckoutFindQuery_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock | CheckoutFindQuery_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable;

export type CheckoutFindQuery_checkout_Checkout = { id: string, email: string | null, displayGrossPrices: boolean, voucherCode: string | null, authorizeStatus: Types.CheckoutAuthorizeStatusEnum, chargeStatus: Types.CheckoutChargeStatusEnum, discount: CheckoutFindQuery_checkout_Checkout_discount_Money | null, shippingMethods: Array<CheckoutFindQuery_checkout_Checkout_shippingMethods_ShippingMethod>, shippingAddress: CheckoutFindQuery_checkout_Checkout_shippingAddress_Address | null, billingAddress: CheckoutFindQuery_checkout_Checkout_billingAddress_Address | null, deliveryMethod: CheckoutFindQuery_checkout_Checkout_deliveryMethod_ShippingMethod_Warehouse | null, availablePaymentGateways: Array<CheckoutFindQuery_checkout_Checkout_availablePaymentGateways_PaymentGateway>, lines: Array<CheckoutFindQuery_checkout_Checkout_lines_CheckoutLine>, totalPrice: CheckoutFindQuery_checkout_Checkout_totalPrice_TaxedMoney, subtotalPrice: CheckoutFindQuery_checkout_Checkout_subtotalPrice_TaxedMoney, shippingPrice: CheckoutFindQuery_checkout_Checkout_shippingPrice_TaxedMoney, problems: Array<CheckoutFindQuery_checkout_Checkout_problems> | null };

export type CheckoutFindQuery_Query = { checkout: CheckoutFindQuery_checkout_Checkout | null };


export type CheckoutFindQueryVariables = Types.Exact<{
  checkoutId: Types.Scalars['ID']['input'];
  countryCode: Types.CountryCode;
  languageCode: Types.LanguageCodeEnum;
  thumbnailSize: Types.Scalars['Int']['input'];
  thumbnailFormat: Types.ThumbnailFormatEnum;
}>;


export type CheckoutFindQuery = CheckoutFindQuery_Query;

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

export const CheckoutFindQueryDocument = new TypedDocumentString(`
    query CheckoutFindQuery($checkoutId: ID!, $countryCode: CountryCode!, $languageCode: LanguageCodeEnum!, $thumbnailSize: Int!, $thumbnailFormat: ThumbnailFormatEnum!) {
  checkout(id: $checkoutId) {
    ...CheckoutFragment
  }
}
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
}`) as unknown as TypedDocumentString<CheckoutFindQuery, CheckoutFindQueryVariables>;