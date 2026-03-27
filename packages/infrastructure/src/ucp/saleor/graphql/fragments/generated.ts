import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type UcpCheckoutSessionFragment_Checkout_discount_Money = { amount: number, currency: string };

export type UcpCheckoutSessionFragment_Checkout_shippingMethods_ShippingMethod_price_Money = { amount: number, currency: string };

export type UcpCheckoutSessionFragment_Checkout_shippingMethods_ShippingMethod = (
  { id: string, name: string, maximumDeliveryDays: number | null, minimumDeliveryDays: number | null, message: string | null, price: UcpCheckoutSessionFragment_Checkout_shippingMethods_ShippingMethod_price_Money }
  & { __typename: 'ShippingMethod' }
);

export type UcpCheckoutSessionFragment_Checkout_shippingAddress_Address_country_CountryDisplay = { country: string, code: string };

export type UcpCheckoutSessionFragment_Checkout_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: UcpCheckoutSessionFragment_Checkout_shippingAddress_Address_country_CountryDisplay };

export type UcpCheckoutSessionFragment_Checkout_billingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: UcpCheckoutSessionFragment_Checkout_shippingAddress_Address_country_CountryDisplay };

export type UcpCheckoutSessionFragment_Checkout_deliveryMethod_ShippingMethod_Warehouse = (
  { id: string, name: string }
  & { __typename: 'ShippingMethod' | 'Warehouse' }
);

export type UcpCheckoutSessionFragment_Checkout_availablePaymentGateways_PaymentGateway_config_GatewayConfigLine = { field: string, value: string | null };

export type UcpCheckoutSessionFragment_Checkout_availablePaymentGateways_PaymentGateway = { name: string, id: string, config: Array<UcpCheckoutSessionFragment_Checkout_availablePaymentGateways_PaymentGateway_config_GatewayConfigLine> };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney = { net: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_net_Money, gross: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_gross_Money };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money = { amount: number, currency: string };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation = { name: string };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia = { url: string, alt: string };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation = { name: string };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute = { slug: string | null, inputType: Types.AttributeInputTypeEnum | null, name: string | null, translation: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation | null };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation = { name: string, plainText: string | null, richText: string | null };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File = { url: string };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue = { slug: string | null, name: string | null, plainText: string | null, richText: string | null, boolean: boolean | null, date: string | null, dateTime: string | null, reference: string | null, value: string | null, translation: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation | null, file: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File | null };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute = { attribute: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute, values: Array<UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue> };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image = { alt: string | null, url: string };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation = { name: string | null };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product = { id: string, slug: string, name: string, vendorId?: string | null, thumbnail: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image | null, translation: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation | null };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money = { currency: string, amount: number };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money = { currency: string, amount: number };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money = { currency: string, amount: number };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney = { net: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo = { discount: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney | null };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant = { id: string, quantityAvailable: number | null, quantityLimitPerCustomer: number | null, name: string, sku: string | null, translation: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation | null, media: Array<UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia> | null, selectionAttributes: Array<UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute>, product: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product, pricing: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo | null };

export type UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine = { id: string, quantity: number, totalPrice: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type UcpCheckoutSessionFragment_Checkout_totalPrice_TaxedMoney = { net: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type UcpCheckoutSessionFragment_Checkout_subtotalPrice_TaxedMoney = { net: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type UcpCheckoutSessionFragment_Checkout_shippingPrice_TaxedMoney = { net: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type UcpCheckoutSessionFragment_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine = { id: string, quantity: number, totalPrice: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type UcpCheckoutSessionFragment_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine = { id: string, quantity: number, totalPrice: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type UcpCheckoutSessionFragment_Checkout_problems_CheckoutLineProblemInsufficientStock = (
  { availableQuantity: number | null, line: UcpCheckoutSessionFragment_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemInsufficientStock' }
);

export type UcpCheckoutSessionFragment_Checkout_problems_CheckoutLineProblemVariantNotAvailable = (
  { line: UcpCheckoutSessionFragment_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemVariantNotAvailable' }
);

export type UcpCheckoutSessionFragment_Checkout_problems =
  | UcpCheckoutSessionFragment_Checkout_problems_CheckoutLineProblemInsufficientStock
  | UcpCheckoutSessionFragment_Checkout_problems_CheckoutLineProblemVariantNotAvailable
;

export type UcpCheckoutSessionFragment = { id: string, email: string | null, displayGrossPrices: boolean, voucherCode: string | null, isShippingRequired: boolean, authorizeStatus: Types.CheckoutAuthorizeStatusEnum, chargeStatus: Types.CheckoutChargeStatusEnum, buyer: string | null, discount: UcpCheckoutSessionFragment_Checkout_discount_Money | null, shippingMethods: Array<UcpCheckoutSessionFragment_Checkout_shippingMethods_ShippingMethod>, shippingAddress: UcpCheckoutSessionFragment_Checkout_shippingAddress_Address | null, billingAddress: UcpCheckoutSessionFragment_Checkout_billingAddress_Address | null, deliveryMethod: UcpCheckoutSessionFragment_Checkout_deliveryMethod_ShippingMethod_Warehouse | null, availablePaymentGateways: Array<UcpCheckoutSessionFragment_Checkout_availablePaymentGateways_PaymentGateway>, lines: Array<UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine>, totalPrice: UcpCheckoutSessionFragment_Checkout_totalPrice_TaxedMoney, subtotalPrice: UcpCheckoutSessionFragment_Checkout_subtotalPrice_TaxedMoney, shippingPrice: UcpCheckoutSessionFragment_Checkout_shippingPrice_TaxedMoney, problems: Array<UcpCheckoutSessionFragment_Checkout_problems> | null };

export type UcpOrderFragment_Order_metadata_MetadataItem = { key: string, value: string };

export type UcpOrderFragment_Order_fulfillments_Fulfillment = { id: string, status: Types.FulfillmentStatus };

export type UcpOrderFragment_Order_lines_OrderLine_discounts_OrderLineDiscount_total_Money = { currency: string, amount: number };

export type UcpOrderFragment_Order_lines_OrderLine_discounts_OrderLineDiscount = { total: UcpOrderFragment_Order_lines_OrderLine_discounts_OrderLineDiscount_total_Money };

export type UcpOrderFragment_Order_lines_OrderLine_unitPrice_TaxedMoney = { net: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type UcpOrderFragment_Order_lines_OrderLine_totalPrice_TaxedMoney = { net: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: UcpCheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type UcpOrderFragment_Order_lines_OrderLine = { id: string, quantity: number, quantityFulfilled: number, productName: string, variantName: string, productVariantId: string | null, discounts: Array<UcpOrderFragment_Order_lines_OrderLine_discounts_OrderLineDiscount> | null, unitPrice: UcpOrderFragment_Order_lines_OrderLine_unitPrice_TaxedMoney, totalPrice: UcpOrderFragment_Order_lines_OrderLine_totalPrice_TaxedMoney };

export type UcpOrderFragment_Order_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: UcpCheckoutSessionFragment_Checkout_shippingAddress_Address_country_CountryDisplay };

export type UcpOrderFragment_Order_billingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: UcpCheckoutSessionFragment_Checkout_shippingAddress_Address_country_CountryDisplay };

export type UcpOrderFragment = { id: string, checkoutId: string | null, created: string, status: Types.OrderStatus, paymentStatus: Types.PaymentChargeStatusEnum, displayGrossPrices: boolean, metadata: Array<UcpOrderFragment_Order_metadata_MetadataItem>, fulfillments: Array<UcpOrderFragment_Order_fulfillments_Fulfillment>, lines: Array<UcpOrderFragment_Order_lines_OrderLine>, shippingAddress: UcpOrderFragment_Order_shippingAddress_Address | null, billingAddress: UcpOrderFragment_Order_billingAddress_Address | null };

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
export const UcpCheckoutSessionFragment = new TypedDocumentString(`
    fragment UCPCheckoutSessionFragment on Checkout {
  ...CheckoutFragment
  buyer: metafield(key: "ucp.buyer.json")
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
      vendorId: metafield(key: "vendor.id") @include(if: $isMarketplaceEnabled)
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
}`, {"fragmentName":"UCPCheckoutSessionFragment"}) as unknown as TypedDocumentString<UcpCheckoutSessionFragment, unknown>;
export const UcpOrderFragment = new TypedDocumentString(`
    fragment UCPOrderFragment on Order {
  id
  checkoutId
  created
  status
  paymentStatus
  displayGrossPrices
  metadata {
    key
    value
  }
  fulfillments {
    id
    status
  }
  lines {
    id
    quantity
    quantityFulfilled
    productName
    variantName
    productVariantId
    discounts {
      total {
        ...MoneyFragment
      }
    }
    unitPrice {
      ...TaxedMoneyFragment
    }
    totalPrice {
      ...TaxedMoneyFragment
    }
  }
  shippingAddress {
    ...AddressFragment
  }
  billingAddress {
    ...AddressFragment
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
}`, {"fragmentName":"UCPOrderFragment"}) as unknown as TypedDocumentString<UcpOrderFragment, unknown>;