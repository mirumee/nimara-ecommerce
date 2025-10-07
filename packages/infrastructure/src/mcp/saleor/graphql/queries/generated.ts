import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CheckoutSessionGet_checkout_Checkout_user_User_addresses_Address = { phone: string | null };

export type CheckoutSessionGet_checkout_Checkout_user_User = { firstName: string, lastName: string, email: string, addresses: Array<CheckoutSessionGet_checkout_Checkout_user_User_addresses_Address> };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant = { id: string };

export type CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine = { id: string, quantity: number, variant: CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutSessionGet_checkout_Checkout_shippingMethods_ShippingMethod = { id: string, name: string };

export type CheckoutSessionGet_checkout_Checkout_totalPrice_TaxedMoney_gross_Money = { amount: number };

export type CheckoutSessionGet_checkout_Checkout_totalPrice_TaxedMoney_net_Money = { amount: number };

export type CheckoutSessionGet_checkout_Checkout_totalPrice_TaxedMoney_tax_Money = { amount: number };

export type CheckoutSessionGet_checkout_Checkout_totalPrice_TaxedMoney = { currency: string, gross: CheckoutSessionGet_checkout_Checkout_totalPrice_TaxedMoney_gross_Money, net: CheckoutSessionGet_checkout_Checkout_totalPrice_TaxedMoney_net_Money, tax: CheckoutSessionGet_checkout_Checkout_totalPrice_TaxedMoney_tax_Money };

export type CheckoutSessionGet_checkout_Checkout = { id: string, chargeStatus: Types.CheckoutChargeStatusEnum, user: CheckoutSessionGet_checkout_Checkout_user_User | null, lines: Array<CheckoutSessionGet_checkout_Checkout_lines_CheckoutLine>, shippingMethods: Array<CheckoutSessionGet_checkout_Checkout_shippingMethods_ShippingMethod>, totalPrice: CheckoutSessionGet_checkout_Checkout_totalPrice_TaxedMoney };

export type CheckoutSessionGet_Query = { checkout: CheckoutSessionGet_checkout_Checkout | null };


export type CheckoutSessionGetVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
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
    query CheckoutSessionGet($id: ID!) {
  checkout(id: $id) {
    ...CheckoutSessionFragment
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