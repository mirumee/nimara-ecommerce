import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CheckoutQuery_checkout_Checkout_lines_CheckoutLine = { id: string, quantity: number };

export type CheckoutQuery_checkout_Checkout = { id: string, lines: Array<CheckoutQuery_checkout_Checkout_lines_CheckoutLine> };

export type CheckoutQuery_Query = { checkout: CheckoutQuery_checkout_Checkout | null };


export type CheckoutQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type CheckoutQuery = CheckoutQuery_Query;

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

export const CheckoutQueryDocument = new TypedDocumentString(`
    query CheckoutQuery($id: ID!) {
  checkout(id: $id) {
    ...CheckoutSession
  }
}
    fragment CheckoutSession on Checkout {
  id
  lines {
    id
    quantity
  }
}`) as unknown as TypedDocumentString<CheckoutQuery, CheckoutQueryVariables>;
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