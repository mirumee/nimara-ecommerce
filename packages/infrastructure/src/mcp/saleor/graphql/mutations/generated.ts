import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AcpCheckoutCompleteMutation_checkoutComplete_CheckoutComplete_order_Order = { id: string };

export type AcpCheckoutCompleteMutation_checkoutComplete_CheckoutComplete_errors_CheckoutError = { field: string | null, message: string | null, code: Types.CheckoutErrorCode };

export type AcpCheckoutCompleteMutation_checkoutComplete_CheckoutComplete = { order: AcpCheckoutCompleteMutation_checkoutComplete_CheckoutComplete_order_Order | null, errors: Array<AcpCheckoutCompleteMutation_checkoutComplete_CheckoutComplete_errors_CheckoutError> };

export type AcpCheckoutCompleteMutation_Mutation = { checkoutComplete: AcpCheckoutCompleteMutation_checkoutComplete_CheckoutComplete | null };


export type AcpCheckoutCompleteMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type AcpCheckoutCompleteMutation = AcpCheckoutCompleteMutation_Mutation;

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_discount_Money = { amount: number, currency: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingMethods_ShippingMethod_price_Money = { amount: number, currency: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingMethods_ShippingMethod = (
  { id: string, name: string, maximumDeliveryDays: number | null, minimumDeliveryDays: number | null, message: string | null, price: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingMethods_ShippingMethod_price_Money }
  & { __typename: 'ShippingMethod' }
);

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingAddress_Address_country_CountryDisplay = { country: string, code: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingAddress_Address_country_CountryDisplay };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_billingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingAddress_Address_country_CountryDisplay };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_deliveryMethod_ShippingMethod_Warehouse = (
  { id: string, name: string }
  & { __typename: 'ShippingMethod' | 'Warehouse' }
);

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_availablePaymentGateways_PaymentGateway_config_GatewayConfigLine = { field: string, value: string | null };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_availablePaymentGateways_PaymentGateway = { name: string, id: string, config: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_availablePaymentGateways_PaymentGateway_config_GatewayConfigLine> };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney = { net: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_net_Money, gross: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_gross_Money };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money = { amount: number, currency: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation = { name: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia = { url: string, alt: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation = { name: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute = { slug: string | null, inputType: Types.AttributeInputTypeEnum | null, name: string | null, translation: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation | null };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation = { name: string, plainText: string | null, richText: string | null };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File = { url: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue = { slug: string | null, name: string | null, plainText: string | null, richText: string | null, boolean: boolean | null, date: string | null, dateTime: string | null, reference: string | null, value: string | null, translation: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation | null, file: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File | null };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute = { attribute: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute, values: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue> };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image = { alt: string | null, url: string };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation = { name: string | null };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product = { id: string, slug: string, name: string, thumbnail: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image | null, translation: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation | null };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money = { currency: string, amount: number };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money = { currency: string, amount: number };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney = { net: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo = { discount: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney | null };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant = { id: string, quantityAvailable: number | null, quantityLimitPerCustomer: number | null, name: string, sku: string | null, translation: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation | null, media: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia> | null, selectionAttributes: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute>, product: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product, pricing: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo | null };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine = { id: string, quantity: number, totalPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney = { net: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_subtotalPrice_TaxedMoney = { net: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingPrice_TaxedMoney = { net: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine = { id: string, quantity: number, totalPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine = { id: string, quantity: number, totalPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock = (
  { availableQuantity: number | null, line: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemInsufficientStock' }
);

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable = (
  { line: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemVariantNotAvailable' }
);

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_problems = CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock | CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable;

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout = { id: string, email: string | null, displayGrossPrices: boolean, voucherCode: string | null, isShippingRequired: boolean, authorizeStatus: Types.CheckoutAuthorizeStatusEnum, chargeStatus: Types.CheckoutChargeStatusEnum, fulfillmentAddress: string | null, buyer: string | null, discount: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_discount_Money | null, shippingMethods: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingMethods_ShippingMethod>, shippingAddress: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingAddress_Address | null, billingAddress: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_billingAddress_Address | null, deliveryMethod: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_deliveryMethod_ShippingMethod_Warehouse | null, availablePaymentGateways: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_availablePaymentGateways_PaymentGateway>, lines: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_lines_CheckoutLine>, totalPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_totalPrice_TaxedMoney, subtotalPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_subtotalPrice_TaxedMoney, shippingPrice: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingPrice_TaxedMoney, problems: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_problems> | null };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate_errors_CheckoutError = { field: string | null, message: string | null, code: Types.CheckoutErrorCode, variants: Array<string> | null, lines: Array<string> | null, addressType: Types.AddressTypeEnum | null };

export type CheckoutSessionCreate_checkoutCreate_CheckoutCreate = { checkout: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout | null, errors: Array<CheckoutSessionCreate_checkoutCreate_CheckoutCreate_errors_CheckoutError> };

export type CheckoutSessionCreate_Mutation = { checkoutCreate: CheckoutSessionCreate_checkoutCreate_CheckoutCreate | null };


export type CheckoutSessionCreateVariables = Types.Exact<{
  input: Types.CheckoutCreateInput;
  languageCode: Types.LanguageCodeEnum;
  countryCode?: Types.InputMaybe<Types.CountryCode>;
  thumbnailSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  thumbnailFormat?: Types.InputMaybe<Types.ThumbnailFormatEnum>;
}>;


export type CheckoutSessionCreate = CheckoutSessionCreate_Mutation;

export type CheckoutSessionUpdate_checkoutEmailUpdate_CheckoutEmailUpdate_checkout_Checkout = { email: string | null };

export type CheckoutSessionUpdate_checkoutEmailUpdate_CheckoutEmailUpdate_errors_CheckoutError = { field: string | null, message: string | null, code: Types.CheckoutErrorCode };

export type CheckoutSessionUpdate_checkoutEmailUpdate_CheckoutEmailUpdate = { checkout: CheckoutSessionUpdate_checkoutEmailUpdate_CheckoutEmailUpdate_checkout_Checkout | null, errors: Array<CheckoutSessionUpdate_checkoutEmailUpdate_CheckoutEmailUpdate_errors_CheckoutError> };

export type CheckoutSessionUpdate_checkoutShippingAddressUpdate_CheckoutShippingAddressUpdate_checkout_Checkout_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: CheckoutSessionCreate_checkoutCreate_CheckoutCreate_checkout_Checkout_shippingAddress_Address_country_CountryDisplay };

export type CheckoutSessionUpdate_checkoutShippingAddressUpdate_CheckoutShippingAddressUpdate_checkout_Checkout = { shippingAddress: CheckoutSessionUpdate_checkoutShippingAddressUpdate_CheckoutShippingAddressUpdate_checkout_Checkout_shippingAddress_Address | null };

export type CheckoutSessionUpdate_checkoutShippingAddressUpdate_CheckoutShippingAddressUpdate_errors_CheckoutError = { field: string | null, message: string | null, code: Types.CheckoutErrorCode, addressType: Types.AddressTypeEnum | null };

export type CheckoutSessionUpdate_checkoutShippingAddressUpdate_CheckoutShippingAddressUpdate = { checkout: CheckoutSessionUpdate_checkoutShippingAddressUpdate_CheckoutShippingAddressUpdate_checkout_Checkout | null, errors: Array<CheckoutSessionUpdate_checkoutShippingAddressUpdate_CheckoutShippingAddressUpdate_errors_CheckoutError> };

export type CheckoutSessionUpdate_checkoutDeliveryMethodUpdate_CheckoutDeliveryMethodUpdate_errors_CheckoutError = { field: string | null, message: string | null, code: Types.CheckoutErrorCode };

export type CheckoutSessionUpdate_checkoutDeliveryMethodUpdate_CheckoutDeliveryMethodUpdate = { errors: Array<CheckoutSessionUpdate_checkoutDeliveryMethodUpdate_CheckoutDeliveryMethodUpdate_errors_CheckoutError> };

export type CheckoutSessionUpdate_updateMetadata_UpdateMetadata_errors_MetadataError = { field: string | null, message: string | null, code: Types.MetadataErrorCode };

export type CheckoutSessionUpdate_updateMetadata_UpdateMetadata = { errors: Array<CheckoutSessionUpdate_updateMetadata_UpdateMetadata_errors_MetadataError> };

export type CheckoutSessionUpdate_Mutation = { checkoutEmailUpdate?: CheckoutSessionUpdate_checkoutEmailUpdate_CheckoutEmailUpdate | null, checkoutShippingAddressUpdate?: CheckoutSessionUpdate_checkoutShippingAddressUpdate_CheckoutShippingAddressUpdate | null, checkoutDeliveryMethodUpdate?: CheckoutSessionUpdate_checkoutDeliveryMethodUpdate_CheckoutDeliveryMethodUpdate | null, updateMetadata: CheckoutSessionUpdate_updateMetadata_UpdateMetadata | null };


export type CheckoutSessionUpdateVariables = Types.Exact<{
  checkoutId: Types.Scalars['ID']['input'];
  shippingAddress: Types.AddressInput;
  shouldUpdateShipping: Types.Scalars['Boolean']['input'];
  buyerEmail: Types.Scalars['String']['input'];
  buyerJSON: Types.Scalars['String']['input'];
  shouldUpdateEmail: Types.Scalars['Boolean']['input'];
  fulfillmentAddressJSON: Types.Scalars['String']['input'];
  fulfillmentOptionID: Types.Scalars['ID']['input'];
  shouldUpdateFulfillmentOption: Types.Scalars['Boolean']['input'];
}>;


export type CheckoutSessionUpdate = CheckoutSessionUpdate_Mutation;

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

export const AcpCheckoutCompleteMutationDocument = new TypedDocumentString(`
    mutation ACPCheckoutCompleteMutation($id: ID!) {
  checkoutComplete(id: $id) {
    order {
      id
    }
    errors {
      field
      message
      code
    }
  }
}
    `) as unknown as TypedDocumentString<AcpCheckoutCompleteMutation, AcpCheckoutCompleteMutationVariables>;
export const CheckoutSessionCreateDocument = new TypedDocumentString(`
    mutation CheckoutSessionCreate($input: CheckoutCreateInput!, $languageCode: LanguageCodeEnum!, $countryCode: CountryCode = US, $thumbnailSize: Int = 128, $thumbnailFormat: ThumbnailFormatEnum = WEBP) {
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
  ...CheckoutFragment
  fulfillmentAddress: metafield(key: "acp.fulfillmentAddress.json")
  buyer: metafield(key: "acp.buyer.json")
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
}`) as unknown as TypedDocumentString<CheckoutSessionCreate, CheckoutSessionCreateVariables>;
export const CheckoutSessionUpdateDocument = new TypedDocumentString(`
    mutation CheckoutSessionUpdate($checkoutId: ID!, $shippingAddress: AddressInput!, $shouldUpdateShipping: Boolean!, $buyerEmail: String!, $buyerJSON: String!, $shouldUpdateEmail: Boolean!, $fulfillmentAddressJSON: String!, $fulfillmentOptionID: ID!, $shouldUpdateFulfillmentOption: Boolean!) {
  checkoutEmailUpdate(checkoutId: $checkoutId, email: $buyerEmail) @include(if: $shouldUpdateEmail) {
    checkout {
      email
    }
    errors {
      field
      message
      code
    }
  }
  checkoutShippingAddressUpdate(
    checkoutId: $checkoutId
    shippingAddress: $shippingAddress
  ) @include(if: $shouldUpdateShipping) {
    checkout {
      shippingAddress {
        ...AddressFragment
      }
    }
    errors {
      field
      message
      code
      addressType
    }
  }
  checkoutDeliveryMethodUpdate(
    deliveryMethodId: $fulfillmentOptionID
    id: $checkoutId
  ) @include(if: $shouldUpdateFulfillmentOption) {
    errors {
      field
      message
      code
    }
  }
  updateMetadata(
    id: $checkoutId
    input: [{key: "acp.fulfillmentAddress.json", value: $fulfillmentAddressJSON}, {key: "acp.buyer.json", value: $buyerJSON}]
  ) {
    errors {
      field
      message
      code
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
}`) as unknown as TypedDocumentString<CheckoutSessionUpdate, CheckoutSessionUpdateVariables>;