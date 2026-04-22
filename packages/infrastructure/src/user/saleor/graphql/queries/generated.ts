import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CurrentUser_me_User_metadata_MetadataItem = { key: string, value: string };

export type CurrentUser_me_User = { id: string, email: string, firstName: string, lastName: string, checkoutIds: Array<string> | null, metadata: Array<CurrentUser_me_User_metadata_MetadataItem> };

export type CurrentUser_Query = { me: CurrentUser_me_User | null };


export type CurrentUserVariables = Types.Exact<{ [key: string]: never; }>;


export type CurrentUser = CurrentUser_Query;

export type UserAddressesQuery_me_User_addresses_Address_country_CountryDisplay = { country: string, code: string };

export type UserAddressesQuery_me_User_addresses_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: UserAddressesQuery_me_User_addresses_Address_country_CountryDisplay };

export type UserAddressesQuery_me_User = { id: string, addresses: Array<UserAddressesQuery_me_User_addresses_Address> };

export type UserAddressesQuery_Query = { me: UserAddressesQuery_me_User | null };


export type UserAddressesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type UserAddressesQuery = UserAddressesQuery_Query;

export type UserFindQuery_user_User = { id: string, email: string };

export type UserFindQuery_Query = { user: UserFindQuery_user_User | null };


export type UserFindQueryVariables = Types.Exact<{
  email?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type UserFindQuery = UserFindQuery_Query;

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_totalPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_totalPrice_TaxedMoney_tax_Money = { currency: string, amount: number };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_totalPrice_TaxedMoney = { net: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_totalPrice_TaxedMoney_net_Money, gross: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_totalPrice_TaxedMoney_gross_Money, tax: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_totalPrice_TaxedMoney_tax_Money };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_thumbnail_Image = { url: string, alt: string | null };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation = { name: string };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute = { slug: string | null, inputType: Types.AttributeInputTypeEnum | null, name: string | null, translation: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation | null };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation = { name: string, plainText: string | null, richText: string | null };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File = { url: string };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue = { slug: string | null, name: string | null, plainText: string | null, richText: string | null, boolean: boolean | null, date: string | null, dateTime: string | null, reference: string | null, value: string | null, translation: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation | null, file: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File | null };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute = { attribute: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute, values: Array<UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue> };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_variant_ProductVariant = { selectionAttributes: Array<UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_variant_ProductVariant_selectionAttributes_SelectedAttribute> };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine = { id: string, productName: string, variantName: string, quantity: number, translatedProductName: string, translatedVariantName: string, totalPrice: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_totalPrice_TaxedMoney, thumbnail: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_thumbnail_Image | null, variant: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_variant_ProductVariant | null };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_total_TaxedMoney = { net: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_totalPrice_TaxedMoney_net_Money, gross: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_totalPrice_TaxedMoney_gross_Money, tax: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine_totalPrice_TaxedMoney_tax_Money };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_fulfillments_Fulfillment_lines_FulfillmentLine_orderLine_OrderLine = { id: string, productName: string, productVariantId: string | null };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_fulfillments_Fulfillment_lines_FulfillmentLine = { id: string, quantity: number, orderLine: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_fulfillments_Fulfillment_lines_FulfillmentLine_orderLine_OrderLine | null };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_fulfillments_Fulfillment = { status: Types.FulfillmentStatus, lines: Array<UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_fulfillments_Fulfillment_lines_FulfillmentLine> | null };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order = { id: string, created: string, number: string, displayGrossPrices: boolean, status: Types.OrderStatus, lines: Array<UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_lines_OrderLine>, total: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_total_TaxedMoney, fulfillments: Array<UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_fulfillments_Fulfillment> };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge = { node: UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order };

export type UserOrdersQuery_me_User_orders_OrderCountableConnection = { edges: Array<UserOrdersQuery_me_User_orders_OrderCountableConnection_edges_OrderCountableEdge> };

export type UserOrdersQuery_me_User = { id: string, orders: UserOrdersQuery_me_User_orders_OrderCountableConnection | null };

export type UserOrdersQuery_Query = { me: UserOrdersQuery_me_User | null };


export type UserOrdersQueryVariables = Types.Exact<{
  languageCode: Types.LanguageCodeEnum;
  thumbnailSize: Types.Scalars['Int']['input'];
  thumbnailFormat: Types.ThumbnailFormatEnum;
}>;


export type UserOrdersQuery = UserOrdersQuery_Query;

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

export const CurrentUserDocument = new TypedDocumentString(`
    query CurrentUser {
  me {
    ...UserFragment
  }
}
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
}`) as unknown as TypedDocumentString<CurrentUser, CurrentUserVariables>;
export const UserAddressesQueryDocument = new TypedDocumentString(`
    query UserAddressesQuery {
  me {
    id
    addresses {
      ...AddressFragment
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
}`) as unknown as TypedDocumentString<UserAddressesQuery, UserAddressesQueryVariables>;
export const UserFindQueryDocument = new TypedDocumentString(`
    query UserFindQuery($email: String) {
  user(email: $email) {
    id
    email
  }
}
    `) as unknown as TypedDocumentString<UserFindQuery, UserFindQueryVariables>;
export const UserOrdersQueryDocument = new TypedDocumentString(`
    query UserOrdersQuery($languageCode: LanguageCodeEnum!, $thumbnailSize: Int!, $thumbnailFormat: ThumbnailFormatEnum!) {
  me {
    id
    orders(first: 100) {
      edges {
        node {
          ...OrderFragment
        }
      }
    }
  }
}
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
}`) as unknown as TypedDocumentString<UserOrdersQuery, UserOrdersQueryVariables>;