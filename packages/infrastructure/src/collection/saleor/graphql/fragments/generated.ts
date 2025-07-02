import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CollectionFragment_Collection_backgroundImage_Image = { url: string, alt: string | null };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_translation_ProductTranslation = { name: string | null };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_thumbnail_Image = { url: string, alt: string | null };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money = { amount: number };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney = { gross: CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo = { price: CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney | null };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant = { pricing: CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo | null };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_media_ProductMedia = { url: string, alt: string };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money = { amount: number };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money = { amount: number };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney = { currency: string, gross: CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money, net: CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_gross_Money = { amount: number };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_net_Money = { amount: number };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney = { currency: string, gross: CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_gross_Money, net: CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_net_Money };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange = { start: CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney | null, stop: CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney | null };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo = { priceRange: CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange | null };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product = { id: string, name: string, slug: string, updatedAt: string, translation: CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_translation_ProductTranslation | null, thumbnail: CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_thumbnail_Image | null, variants: Array<CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant> | null, media: Array<CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_media_ProductMedia> | null, pricing: CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo | null };

export type CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge = { node: CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product };

export type CollectionFragment_Collection_products_ProductCountableConnection_pageInfo_PageInfo = { startCursor: string | null, endCursor: string | null, hasNextPage: boolean, hasPreviousPage: boolean };

export type CollectionFragment_Collection_products_ProductCountableConnection = { edges: Array<CollectionFragment_Collection_products_ProductCountableConnection_edges_ProductCountableEdge>, pageInfo: CollectionFragment_Collection_products_ProductCountableConnection_pageInfo_PageInfo };

export type CollectionFragment_Collection_metadata_MetadataItem = { key: string, value: string };

export type CollectionFragment = { id: string, name: string, description: string | null, seoTitle: string | null, seoDescription: string | null, slug: string, backgroundImage: CollectionFragment_Collection_backgroundImage_Image | null, products: CollectionFragment_Collection_products_ProductCountableConnection | null, metadata: Array<CollectionFragment_Collection_metadata_MetadataItem> };

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
export const CollectionFragment = new TypedDocumentString(`
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
}`, {"fragmentName":"CollectionFragment"}) as unknown as TypedDocumentString<CollectionFragment, unknown>;