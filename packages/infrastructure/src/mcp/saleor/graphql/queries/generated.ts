import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CheckoutSessionGet_checkout_Checkout_discount_Money = { amount: number, currency: string };

export type CheckoutSessionGet_checkout_Checkout_shippingMethods_ShippingMethod_price_Money = { amount: number, currency: string };

export type CheckoutSessionGet_checkout_Checkout_shippingMethods_ShippingMethod = (
  { id: string, name: string, maximumDeliveryDays: number | null, minimumDeliveryDays: number | null, message: string | null, price: CheckoutSessionGet_checkout_Checkout_shippingMethods_ShippingMethod_price_Money }
  & { __typename: 'ShippingMethod' }
);

export type CheckoutSessionGet_checkout_Checkout_shippingAddress_Address_country_CountryDisplay = { country: string, code: string };

export type CheckoutSessionGet_checkout_Checkout_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: CheckoutSessionGet_checkout_Checkout_shippingAddress_Address_country_CountryDisplay };

export type CheckoutSessionGet_checkout_Checkout_billingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: CheckoutSessionGet_checkout_Checkout_shippingAddress_Address_country_CountryDisplay };

export type CheckoutSessionGet_checkout_Checkout_deliveryMethod_ShippingMethod_Warehouse = (
  { id: string, name: string }
  & { __typename: 'ShippingMethod' | 'Warehouse' }
);

export type CheckoutSessionGet_checkout_Checkout_availablePaymentGateways_PaymentGateway_config_GatewayConfigLine = { field: string, value: string | null };

export type CheckoutSessionGet_checkout_Checkout_availablePaymentGateways_PaymentGateway = { name: string, id: string, config: Array<CheckoutSessionGet_checkout_Checkout_availablePaymentGateways_PaymentGateway_config_GatewayConfigLine> };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney = { net: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_net_Money, gross: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_gross_Money };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money = { amount: number, currency: string };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation = { name: string };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia = { url: string, alt: string };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation = { name: string };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute = { slug: string | null, inputType: Types.AttributeInputTypeEnum | null, name: string | null, translation: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation | null };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation = { name: string, plainText: string | null, richText: string | null };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File = { url: string };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue = { slug: string | null, name: string | null, plainText: string | null, richText: string | null, boolean: boolean | null, date: string | null, dateTime: string | null, reference: string | null, value: string | null, translation: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation | null, file: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File | null };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute = { attribute: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute, values: Array<CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue> };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image = { alt: string | null, url: string };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation = { name: string | null };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product = { id: string, slug: string, name: string, thumbnail: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image | null, translation: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation | null };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money = { currency: string, amount: number };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money = { currency: string, amount: number };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney = { net: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo = { discount: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney | null };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant = { id: string, quantityAvailable: number | null, quantityLimitPerCustomer: number | null, name: string, sku: string | null, translation: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation | null, media: Array<CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia> | null, selectionAttributes: Array<CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute>, product: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product, pricing: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo | null };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine = { id: string, quantity: number, totalPrice: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutSessionGet_checkout_Checkout_totalPrice_TaxedMoney = { net: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type CheckoutSessionGet_checkout_Checkout_subtotalPrice_TaxedMoney = { net: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type CheckoutSessionGet_checkout_Checkout_shippingPrice_TaxedMoney = { net: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type CheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine = { id: string, quantity: number, totalPrice: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine = { id: string, quantity: number, totalPrice: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock = (
  { availableQuantity: number | null, line: CheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemInsufficientStock' }
);

export type CheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable = (
  { line: CheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemVariantNotAvailable' }
);

export type CheckoutSessionGet_checkout_Checkout_problems = CheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock | CheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable;

export type CheckoutSessionGet_checkout_Checkout = { id: string, email: string | null, displayGrossPrices: boolean, voucherCode: string | null, isShippingRequired: boolean, authorizeStatus: Types.CheckoutAuthorizeStatusEnum, chargeStatus: Types.CheckoutChargeStatusEnum, discount: CheckoutSessionGet_checkout_Checkout_discount_Money | null, shippingMethods: Array<CheckoutSessionGet_checkout_Checkout_shippingMethods_ShippingMethod>, shippingAddress: CheckoutSessionGet_checkout_Checkout_shippingAddress_Address | null, billingAddress: CheckoutSessionGet_checkout_Checkout_billingAddress_Address | null, deliveryMethod: CheckoutSessionGet_checkout_Checkout_deliveryMethod_ShippingMethod_Warehouse | null, availablePaymentGateways: Array<CheckoutSessionGet_checkout_Checkout_availablePaymentGateways_PaymentGateway>, lines: Array<CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine>, totalPrice: CheckoutSessionGet_checkout_Checkout_totalPrice_TaxedMoney, subtotalPrice: CheckoutSessionGet_checkout_Checkout_subtotalPrice_TaxedMoney, shippingPrice: CheckoutSessionGet_checkout_Checkout_shippingPrice_TaxedMoney, problems: Array<CheckoutSessionGet_checkout_Checkout_problems> | null };

export type CheckoutSessionGet_Query = { checkout: CheckoutSessionGet_checkout_Checkout | null };


export type CheckoutSessionGetVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  languageCode: Types.LanguageCodeEnum;
  countryCode?: Types.InputMaybe<Types.CountryCode>;
  thumbnailSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  thumbnailFormat?: Types.InputMaybe<Types.ThumbnailFormatEnum>;
}>;


export type CheckoutSessionGet = CheckoutSessionGet_Query;

export type ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_media_ProductMedia = { url: string };

export type ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute_attribute_Attribute = { id: string, name: string | null };

export type ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute_values_AttributeValue = { id: string, name: string | null, value: string | null };

export type ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute = { attribute: ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute_attribute_Attribute, values: Array<ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute_values_AttributeValue> };

export type ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money = { amount: number, currency: string };

export type ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney = { gross: ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money };

export type ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo = { price: ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney | null };

export type ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_attributes_SelectedAttribute_attribute_Attribute = { id: string, name: string | null };

export type ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_attributes_SelectedAttribute_values_AttributeValue = { id: string, name: string | null, value: string | null };

export type ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_attributes_SelectedAttribute = { attribute: ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_attributes_SelectedAttribute_attribute_Attribute, values: Array<ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_attributes_SelectedAttribute_values_AttributeValue> };

export type ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant = { id: string, sku: string | null, quantityAvailable: number | null, pricing: ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo | null, attributes: Array<ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_attributes_SelectedAttribute> };

export type ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product = { id: string, name: string, slug: string, description: string | null, media: Array<ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_media_ProductMedia> | null, attributes: Array<ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute>, variants: Array<ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant> | null };

export type ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge = { node: ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product };

export type ProductsFeedQuery_products_ProductCountableConnection_pageInfo_PageInfo = { startCursor: string | null, endCursor: string | null, hasNextPage: boolean, hasPreviousPage: boolean };

export type ProductsFeedQuery_products_ProductCountableConnection = { totalCount: number | null, edges: Array<ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge>, pageInfo: ProductsFeedQuery_products_ProductCountableConnection_pageInfo_PageInfo };

export type ProductsFeedQuery_Query = { products: ProductsFeedQuery_products_ProductCountableConnection | null };


export type ProductsFeedQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  channel: Types.Scalars['String']['input'];
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type ProductsFeedQuery = ProductsFeedQuery_Query;

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

export const CheckoutSessionGetDocument = new TypedDocumentString(`
    query CheckoutSessionGet($id: ID!, $languageCode: LanguageCodeEnum!, $countryCode: CountryCode = US, $thumbnailSize: Int = 128, $thumbnailFormat: ThumbnailFormatEnum = WEBP) {
  checkout(id: $id) {
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
    __typename
    id
    name
    maximumDeliveryDays
    minimumDeliveryDays
    message
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
  isShippingRequired
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
    selectionAttributes: attributes(variantSelection: VARIANT_SELECTION) {
      ...SelectionAttributeFragment
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
    pricing {
      discount {
        ...TaxedMoneyFragment
      }
    }
  }
}
fragment MoneyFragment on Money {
  currency
  amount
}
fragment SelectionAttributeFragment on SelectedAttribute {
  attribute {
    ...AttributeFragment
  }
  values {
    ...AttributeValueFragment
  }
}
fragment AttributeFragment on Attribute {
  slug
  inputType
  name
  translation(languageCode: $languageCode) {
    name
  }
}
fragment AttributeValueFragment on AttributeValue {
  slug
  name
  plainText
  richText
  boolean
  date
  dateTime
  reference
  value
  translation(languageCode: $languageCode) {
    name
    plainText
    richText
  }
  file {
    url
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
}`) as unknown as TypedDocumentString<CheckoutSessionGet, CheckoutSessionGetVariables>;
export const ProductsFeedQueryDocument = new TypedDocumentString(`
    query ProductsFeedQuery($after: String, $before: String, $channel: String!, $first: Int) {
  products(after: $after, before: $before, channel: $channel, first: $first) {
    edges {
      node {
        ...ProductFeedFragment
      }
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}
    fragment ProductFeedFragment on Product {
  id
  name
  slug
  description
  media {
    url
  }
  attributes {
    attribute {
      id
      name
    }
    values {
      id
      name
      value: name
    }
  }
  variants {
    id
    sku
    pricing {
      price {
        gross {
          amount
          currency
        }
      }
    }
    quantityAvailable
    attributes {
      attribute {
        id
        name
      }
      values {
        id
        name
        value: name
      }
    }
  }
}`) as unknown as TypedDocumentString<ProductsFeedQuery, ProductsFeedQueryVariables>;