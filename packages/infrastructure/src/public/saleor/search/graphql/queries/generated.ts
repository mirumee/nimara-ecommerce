import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge_node_Attribute_translation_AttributeTranslation = { name: string };

export type FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge_node_Attribute_choices_AttributeValueCountableConnection_edges_AttributeValueCountableEdge_node_AttributeValue_translation_AttributeValueTranslation = { name: string };

export type FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge_node_Attribute_choices_AttributeValueCountableConnection_edges_AttributeValueCountableEdge_node_AttributeValue = { name: string | null, slug: string | null, translation: FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge_node_Attribute_choices_AttributeValueCountableConnection_edges_AttributeValueCountableEdge_node_AttributeValue_translation_AttributeValueTranslation | null };

export type FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge_node_Attribute_choices_AttributeValueCountableConnection_edges_AttributeValueCountableEdge = { node: FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge_node_Attribute_choices_AttributeValueCountableConnection_edges_AttributeValueCountableEdge_node_AttributeValue };

export type FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge_node_Attribute_choices_AttributeValueCountableConnection_pageInfo_PageInfo = { startCursor: string | null, hasPreviousPage: boolean, hasNextPage: boolean, endCursor: string | null };

export type FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge_node_Attribute_choices_AttributeValueCountableConnection = { totalCount: number | null, edges: Array<FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge_node_Attribute_choices_AttributeValueCountableConnection_edges_AttributeValueCountableEdge>, pageInfo: FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge_node_Attribute_choices_AttributeValueCountableConnection_pageInfo_PageInfo };

export type FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge_node_Attribute = { name: string | null, slug: string | null, inputType: Types.AttributeInputTypeEnum | null, withChoices: boolean, translation: FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge_node_Attribute_translation_AttributeTranslation | null, choices: FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge_node_Attribute_choices_AttributeValueCountableConnection | null };

export type FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge = { node: FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge_node_Attribute };

export type FacetsQuery_attributes_AttributeCountableConnection = { edges: Array<FacetsQuery_attributes_AttributeCountableConnection_edges_AttributeCountableEdge> };

export type FacetsQuery_Query = { attributes: FacetsQuery_attributes_AttributeCountableConnection | null };


export type FacetsQueryVariables = Types.Exact<{
  choicesAfter?: Types.InputMaybe<Types.Scalars['String']['input']>;
  choicesBefore?: Types.InputMaybe<Types.Scalars['String']['input']>;
  channel?: Types.InputMaybe<Types.Scalars['String']['input']>;
  choicesLast?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  attributesSortBy?: Types.InputMaybe<Types.AttributeSortingInput>;
  languageCode: Types.LanguageCodeEnum;
  attributesPerPage?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  choicesFirst?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type FacetsQuery = FacetsQuery_Query;

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_translation_ProductTranslation = { name: string | null };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_thumbnail_Image = { url: string, alt: string | null };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money = { amount: number };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney = { gross: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo = { price: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney | null };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant = { pricing: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo | null };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_media_ProductMedia = { url: string, alt: string };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money = { amount: number };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money = { amount: number };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney = { currency: string, gross: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money, net: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_gross_Money = { amount: number };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_net_Money = { amount: number };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney = { currency: string, gross: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_gross_Money, net: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_net_Money };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange = { start: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney | null, stop: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney | null };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo = { priceRange: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange | null };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product = { id: string, name: string, slug: string, updatedAt: string, translation: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_translation_ProductTranslation | null, thumbnail: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_thumbnail_Image | null, variants: Array<SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant> | null, media: Array<SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_media_ProductMedia> | null, pricing: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo | null };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge = { node: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_pageInfo_PageInfo = { startCursor: string | null, endCursor: string | null, hasNextPage: boolean, hasPreviousPage: boolean };

export type SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection = { totalCount: number | null, edges: Array<SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge>, pageInfo: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_pageInfo_PageInfo };

export type SearchProductByCategoryQuery_category_Category = { products: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection | null };

export type SearchProductByCategoryQuery_Query = { category: SearchProductByCategoryQuery_category_Category | null };


export type SearchProductByCategoryQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  channel: Types.Scalars['String']['input'];
  filter?: Types.InputMaybe<Types.ProductFilterInput>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  sortBy?: Types.InputMaybe<Types.ProductOrder>;
  languageCode: Types.LanguageCodeEnum;
  where?: Types.InputMaybe<Types.ProductWhereInput>;
  slug?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type SearchProductByCategoryQuery = SearchProductByCategoryQuery_Query;

export type SearchProductByCollectionQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product = { id: string, name: string, slug: string, updatedAt: string, translation: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_translation_ProductTranslation | null, thumbnail: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_thumbnail_Image | null, variants: Array<SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant> | null, media: Array<SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_media_ProductMedia> | null, pricing: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo | null };

export type SearchProductByCollectionQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge = { node: SearchProductByCollectionQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product };

export type SearchProductByCollectionQuery_collection_Collection_products_ProductCountableConnection_pageInfo_PageInfo = { startCursor: string | null, endCursor: string | null, hasNextPage: boolean, hasPreviousPage: boolean };

export type SearchProductByCollectionQuery_collection_Collection_products_ProductCountableConnection = { totalCount: number | null, edges: Array<SearchProductByCollectionQuery_collection_Collection_products_ProductCountableConnection_edges_ProductCountableEdge>, pageInfo: SearchProductByCollectionQuery_collection_Collection_products_ProductCountableConnection_pageInfo_PageInfo };

export type SearchProductByCollectionQuery_collection_Collection = { products: SearchProductByCollectionQuery_collection_Collection_products_ProductCountableConnection | null };

export type SearchProductByCollectionQuery_Query = { collection: SearchProductByCollectionQuery_collection_Collection | null };


export type SearchProductByCollectionQueryVariables = Types.Exact<{
  channel: Types.Scalars['String']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  filter?: Types.InputMaybe<Types.ProductFilterInput>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  sortBy?: Types.InputMaybe<Types.ProductOrder>;
  languageCode: Types.LanguageCodeEnum;
  where?: Types.InputMaybe<Types.ProductWhereInput>;
  slug?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type SearchProductByCollectionQuery = SearchProductByCollectionQuery_Query;

export type SearchProductQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product = { id: string, name: string, slug: string, updatedAt: string, translation: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_translation_ProductTranslation | null, thumbnail: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_thumbnail_Image | null, variants: Array<SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant> | null, media: Array<SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_media_ProductMedia> | null, pricing: SearchProductByCategoryQuery_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo | null };

export type SearchProductQuery_products_ProductCountableConnection_edges_ProductCountableEdge = { node: SearchProductQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product };

export type SearchProductQuery_products_ProductCountableConnection_pageInfo_PageInfo = { startCursor: string | null, endCursor: string | null, hasNextPage: boolean, hasPreviousPage: boolean };

export type SearchProductQuery_products_ProductCountableConnection = { totalCount: number | null, edges: Array<SearchProductQuery_products_ProductCountableConnection_edges_ProductCountableEdge>, pageInfo: SearchProductQuery_products_ProductCountableConnection_pageInfo_PageInfo };

export type SearchProductQuery_Query = { products: SearchProductQuery_products_ProductCountableConnection | null };


export type SearchProductQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  channel: Types.Scalars['String']['input'];
  filter?: Types.InputMaybe<Types.ProductFilterInput>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  sortBy?: Types.InputMaybe<Types.ProductOrder>;
  languageCode: Types.LanguageCodeEnum;
  where?: Types.InputMaybe<Types.ProductWhereInput>;
}>;


export type SearchProductQuery = SearchProductQuery_Query;

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];

  constructor(private value: string, public __meta__?: Record<string, any>) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const FacetsQueryDocument = new TypedDocumentString(`
    query FacetsQuery($choicesAfter: String, $choicesBefore: String, $channel: String, $choicesLast: Int, $attributesSortBy: AttributeSortingInput, $languageCode: LanguageCodeEnum!, $attributesPerPage: Int = 100, $choicesFirst: Int = 10) {
  attributes(
    first: $attributesPerPage
    filter: {filterableInStorefront: true, type: PRODUCT_TYPE}
    channel: $channel
    sortBy: $attributesSortBy
  ) {
    edges {
      node {
        name
        translation(languageCode: $languageCode) {
          name
        }
        slug
        inputType
        withChoices
        choices(
          first: $choicesFirst
          after: $choicesAfter
          before: $choicesBefore
          last: $choicesLast
        ) {
          edges {
            node {
              name
              translation(languageCode: $languageCode) {
                name
              }
              slug
            }
          }
          totalCount
          pageInfo {
            startCursor
            hasPreviousPage
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<FacetsQuery, FacetsQueryVariables>;
export const SearchProductByCategoryQueryDocument = new TypedDocumentString(`
    query SearchProductByCategoryQuery($after: String, $before: String, $channel: String!, $filter: ProductFilterInput, $first: Int, $last: Int, $sortBy: ProductOrder, $languageCode: LanguageCodeEnum!, $where: ProductWhereInput, $slug: String) {
  category(slug: $slug) {
    products(
      after: $after
      before: $before
      channel: $channel
      filter: $filter
      first: $first
      last: $last
      sortBy: $sortBy
      where: $where
    ) {
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
      totalCount
    }
  }
}
    fragment SearchProductFragment on Product {
  id
  name
  translation(languageCode: $languageCode) {
    name
  }
  slug
  thumbnail(format: WEBP, size: 512) {
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
}`) as unknown as TypedDocumentString<SearchProductByCategoryQuery, SearchProductByCategoryQueryVariables>;
export const SearchProductByCollectionQueryDocument = new TypedDocumentString(`
    query SearchProductByCollectionQuery($channel: String!, $after: String, $before: String, $filter: ProductFilterInput, $first: Int, $last: Int, $sortBy: ProductOrder, $languageCode: LanguageCodeEnum!, $where: ProductWhereInput, $slug: String) {
  collection(slug: $slug, channel: $channel) {
    products(
      after: $after
      before: $before
      filter: $filter
      first: $first
      last: $last
      sortBy: $sortBy
      where: $where
    ) {
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
      totalCount
    }
  }
}
    fragment SearchProductFragment on Product {
  id
  name
  translation(languageCode: $languageCode) {
    name
  }
  slug
  thumbnail(format: WEBP, size: 512) {
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
}`) as unknown as TypedDocumentString<SearchProductByCollectionQuery, SearchProductByCollectionQueryVariables>;
export const SearchProductQueryDocument = new TypedDocumentString(`
    query SearchProductQuery($after: String, $before: String, $channel: String!, $filter: ProductFilterInput, $first: Int, $last: Int, $search: String, $sortBy: ProductOrder, $languageCode: LanguageCodeEnum!, $where: ProductWhereInput) {
  products(
    after: $after
    before: $before
    channel: $channel
    filter: $filter
    first: $first
    last: $last
    search: $search
    sortBy: $sortBy
    where: $where
  ) {
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
    totalCount
  }
}
    fragment SearchProductFragment on Product {
  id
  name
  translation(languageCode: $languageCode) {
    name
  }
  slug
  thumbnail(format: WEBP, size: 512) {
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
}`) as unknown as TypedDocumentString<SearchProductQuery, SearchProductQueryVariables>;