import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AddressFragment_Address_country_CountryDisplay = { country: string, code: string };

export type AddressFragment = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: AddressFragment_Address_country_CountryDisplay };

export type OrderFragment_Order_lines_OrderLine_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type OrderFragment_Order_lines_OrderLine_totalPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type OrderFragment_Order_lines_OrderLine_totalPrice_TaxedMoney_tax_Money = { currency: string, amount: number };

export type OrderFragment_Order_lines_OrderLine_totalPrice_TaxedMoney = { net: OrderFragment_Order_lines_OrderLine_totalPrice_TaxedMoney_net_Money, gross: OrderFragment_Order_lines_OrderLine_totalPrice_TaxedMoney_gross_Money, tax: OrderFragment_Order_lines_OrderLine_totalPrice_TaxedMoney_tax_Money };

export type OrderFragment_Order_lines_OrderLine_thumbnail_Image = { url: string, alt: string | null };

export type OrderFragment_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation = { name: string };

export type OrderFragment_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute = { slug: string | null, inputType: Types.AttributeInputTypeEnum | null, name: string | null, translation: OrderFragment_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation | null };

export type OrderFragment_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation = { name: string, plainText: string | null, richText: string | null };

export type OrderFragment_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File = { url: string };

export type OrderFragment_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue = { slug: string | null, name: string | null, plainText: string | null, richText: string | null, boolean: boolean | null, date: string | null, dateTime: string | null, reference: string | null, value: string | null, translation: OrderFragment_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation | null, file: OrderFragment_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File | null };

export type OrderFragment_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute = { attribute: OrderFragment_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute, values: Array<OrderFragment_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue> };

export type OrderFragment_Order_lines_OrderLine_variant_ProductVariant = { selectionAttributes: Array<OrderFragment_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute> };

export type OrderFragment_Order_lines_OrderLine = { id: string, productName: string, variantName: string, quantity: number, translatedProductName: string, translatedVariantName: string, totalPrice: OrderFragment_Order_lines_OrderLine_totalPrice_TaxedMoney, thumbnail: OrderFragment_Order_lines_OrderLine_thumbnail_Image | null, variant: OrderFragment_Order_lines_OrderLine_variant_ProductVariant | null };

export type OrderFragment_Order_total_TaxedMoney = { net: OrderFragment_Order_lines_OrderLine_totalPrice_TaxedMoney_net_Money, gross: OrderFragment_Order_lines_OrderLine_totalPrice_TaxedMoney_gross_Money, tax: OrderFragment_Order_lines_OrderLine_totalPrice_TaxedMoney_tax_Money };

export type OrderFragment_Order_fulfillments_Fulfillment_lines_FulfillmentLine_orderLine_OrderLine = { id: string, productName: string, productVariantId: string | null };

export type OrderFragment_Order_fulfillments_Fulfillment_lines_FulfillmentLine = { id: string, quantity: number, orderLine: OrderFragment_Order_fulfillments_Fulfillment_lines_FulfillmentLine_orderLine_OrderLine | null };

export type OrderFragment_Order_fulfillments_Fulfillment = { status: Types.FulfillmentStatus, lines: Array<OrderFragment_Order_fulfillments_Fulfillment_lines_FulfillmentLine> | null };

export type OrderFragment = { id: string, created: string, number: string, displayGrossPrices: boolean, status: Types.OrderStatus, lines: Array<OrderFragment_Order_lines_OrderLine>, total: OrderFragment_Order_total_TaxedMoney, fulfillments: Array<OrderFragment_Order_fulfillments_Fulfillment> };

export type OrderLineFragment = { id: string, productName: string, variantName: string, quantity: number, translatedProductName: string, translatedVariantName: string, totalPrice: OrderFragment_Order_lines_OrderLine_totalPrice_TaxedMoney, thumbnail: OrderFragment_Order_lines_OrderLine_thumbnail_Image | null, variant: OrderFragment_Order_lines_OrderLine_variant_ProductVariant | null };

export type UserFragment_User_metadata_MetadataItem = { key: string, value: string };

export type UserFragment = { id: string, email: string, firstName: string, lastName: string, checkoutIds: Array<string> | null, metadata: Array<UserFragment_User_metadata_MetadataItem> };

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
export const AddressFragment = new TypedDocumentString(`
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
    `, {"fragmentName":"AddressFragment"}) as unknown as TypedDocumentString<AddressFragment, unknown>;
export const OrderFragment = new TypedDocumentString(`
    fragment OrderFragment on Order {
  id
  created
  lines {
    ...OrderLineFragment
  }
  total {
    ...TaxedMoneyFragment
  }
  number
  displayGrossPrices
  status
  fulfillments {
    status
    lines {
      id
      quantity
      orderLine {
        id
        productName
        productVariantId
      }
    }
  }
}
    fragment OrderLineFragment on OrderLine {
  id
  productName
  variantName
  quantity
  translatedProductName
  translatedVariantName
  totalPrice {
    ...TaxedMoneyFragment
  }
  thumbnail(size: $thumbnailSize, format: $thumbnailFormat) {
    url
    alt
  }
  variant {
    selectionAttributes: attributes(variantSelection: VARIANT_SELECTION) {
      ...SelectionAttributeFragment
    }
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
}`, {"fragmentName":"OrderFragment"}) as unknown as TypedDocumentString<OrderFragment, unknown>;
export const UserFragment = new TypedDocumentString(`
    fragment UserFragment on User {
  id
  email
  firstName
  lastName
  metadata {
    ...MetadataItemFragment
  }
  checkoutIds
}
    fragment MetadataItemFragment on MetadataItem {
  key
  value
}`, {"fragmentName":"UserFragment"}) as unknown as TypedDocumentString<UserFragment, unknown>;