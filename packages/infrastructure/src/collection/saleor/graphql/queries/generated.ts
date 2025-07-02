import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CollectionDetailsQuery_collection_Collection_backgroundImage_Image = { url: string, alt: string | null };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_translation_ProductTranslation = { name: string | null };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_thumbnail_Image = { url: string, alt: string | null };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money = { amount: number };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney = { gross: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo = { price: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney | null };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant = { pricing: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo | null };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_media_ProductMedia = { url: string, alt: string };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money = { amount: number };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money = { amount: number };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney = { currency: string, gross: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money, net: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_gross_Money = { amount: number };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_net_Money = { amount: number };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney = { currency: string, gross: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_gross_Money, net: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_net_Money };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange = { start: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney | null, stop: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney | null };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo = { priceRange: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange | null };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product = { id: string, name: string, slug: string, updatedAt: string, translation: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_translation_ProductTranslation | null, thumbnail: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_thumbnail_Image | null, variants: Array<CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant> | null, media: Array<CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_media_ProductMedia> | null, pricing: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo | null };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge = { node: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_pageInfo_PageInfo = { startCursor: string | null, endCursor: string | null, hasNextPage: boolean, hasPreviousPage: boolean };

export type CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection = { edges: Array<CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge>, pageInfo: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection_pageInfo_PageInfo };

export type CollectionDetailsQuery_collection_Collection_metadata_MetadataItem = { key: string, value: string };

export type CollectionDetailsQuery_collection_Collection = { id: string, name: string, description: string | null, seoTitle: string | null, seoDescription: string | null, slug: string, backgroundImage: CollectionDetailsQuery_collection_Collection_backgroundImage_Image | null, products: CollectionDetailsQuery_collection_Collection_products_ProductCountableConnection | null, metadata: Array<CollectionDetailsQuery_collection_Collection_metadata_MetadataItem> };

export type CollectionDetailsQuery_Query = { collection: CollectionDetailsQuery_collection_Collection | null };


export type CollectionDetailsQueryVariables = Types.Exact<{
  slug?: Types.InputMaybe<Types.Scalars['String']['input']>;
  channel: Types.Scalars['String']['input'];
  languageCode: Types.LanguageCodeEnum;
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  thumbnailSize: Types.Scalars['Int']['input'];
  thumbnailFormat: Types.ThumbnailFormatEnum;
}>;


export type CollectionDetailsQuery = CollectionDetailsQuery_Query;

export type CollectionsIDsBySlugs_collections_CollectionCountableConnection_edges_CollectionCountableEdge_node_Collection = { id: string };

export type CollectionsIDsBySlugs_collections_CollectionCountableConnection_edges_CollectionCountableEdge = { node: CollectionsIDsBySlugs_collections_CollectionCountableConnection_edges_CollectionCountableEdge_node_Collection };

export type CollectionsIDsBySlugs_collections_CollectionCountableConnection = { edges: Array<CollectionsIDsBySlugs_collections_CollectionCountableConnection_edges_CollectionCountableEdge> };

export type CollectionsIDsBySlugs_Query = { collections: CollectionsIDsBySlugs_collections_CollectionCountableConnection | null };


export type CollectionsIDsBySlugsVariables = Types.Exact<{
  channel: Types.Scalars['String']['input'];
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  slugs?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
}>;


export type CollectionsIDsBySlugs = CollectionsIDsBySlugs_Query;

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

export const CollectionDetailsQueryDocument = new TypedDocumentString(`
    query CollectionDetailsQuery($slug: String, $channel: String!, $languageCode: LanguageCodeEnum!, $after: String, $before: String, $first: Int, $last: Int, $thumbnailSize: Int!, $thumbnailFormat: ThumbnailFormatEnum!) {
  collection(slug: $slug, channel: $channel) {
    ...CollectionFragment
  }
}
    fragment CollectionFragment on Collection {
  id
  name
  description
  seoTitle
  seoDescription
  backgroundImage {
    url
    alt
  }
  slug
  products(after: $after, before: $before, first: $first, last: $last) {
    edges {
      node {
        ...SearchProductFragment
      }
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
  }
  metadata {
    ...MetadataItemFragment
  }
}
fragment SearchProductFragment on Product {
  id
  name
  translation(languageCode: $languageCode) {
    name
  }
  slug
  thumbnail(size: $thumbnailSize, format: $thumbnailFormat) {
    url
    alt
  }
  variants {
    pricing {
      price {
        gross {
          amount
        }
      }
    }
  }
  media {
    url
    alt
  }
  pricing {
    priceRange {
      start {
        currency
        gross {
          amount
        }
        net {
          amount
        }
      }
      stop {
        currency
        gross {
          amount
        }
        net {
          amount
        }
      }
    }
  }
  updatedAt
}
fragment MetadataItemFragment on MetadataItem {
  key
  value
}`) as unknown as TypedDocumentString<CollectionDetailsQuery, CollectionDetailsQueryVariables>;
export const CollectionsIDsBySlugsDocument = new TypedDocumentString(`
    query CollectionsIDsBySlugs($channel: String!, $first: Int = 10, $slugs: [String!]) {
  collections(channel: $channel, first: $first, filter: {slugs: $slugs}) {
    edges {
      node {
        id
      }
    }
  }
}
    `) as unknown as TypedDocumentString<CollectionsIDsBySlugs, CollectionsIDsBySlugsVariables>;