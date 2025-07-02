import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money = { currency: string, amount: number };

export type ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money = { currency: string, amount: number };

export type ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_tax_Money = { currency: string, amount: number };

export type ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney = { net: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money, gross: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money, tax: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_tax_Money };

export type ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange = { start: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney | null };

export type ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo = { displayGrossPrices: boolean, priceRange: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange | null };

export type ProductAvailabilityDetailsQuery_product_Product_variantsAvailability_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney = { net: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money, gross: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money, tax: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_tax_Money };

export type ProductAvailabilityDetailsQuery_product_Product_variantsAvailability_ProductVariant_pricing_VariantPricingInfo_priceUndiscounted_TaxedMoney = { net: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money, gross: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money, tax: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_tax_Money };

export type ProductAvailabilityDetailsQuery_product_Product_variantsAvailability_ProductVariant_pricing_VariantPricingInfo = { price: ProductAvailabilityDetailsQuery_product_Product_variantsAvailability_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney | null, priceUndiscounted: ProductAvailabilityDetailsQuery_product_Product_variantsAvailability_ProductVariant_pricing_VariantPricingInfo_priceUndiscounted_TaxedMoney | null };

export type ProductAvailabilityDetailsQuery_product_Product_variantsAvailability_ProductVariant = { id: string, quantityLimitPerCustomer: number | null, quantityAvailable: number | null, pricing: ProductAvailabilityDetailsQuery_product_Product_variantsAvailability_ProductVariant_pricing_VariantPricingInfo | null };

export type ProductAvailabilityDetailsQuery_product_Product = { isAvailable: boolean | null, pricing: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo | null, variantsAvailability: Array<ProductAvailabilityDetailsQuery_product_Product_variantsAvailability_ProductVariant> | null };

export type ProductAvailabilityDetailsQuery_Query = { product: ProductAvailabilityDetailsQuery_product_Product | null };


export type ProductAvailabilityDetailsQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
  channel: Types.Scalars['String']['input'];
  countryCode: Types.CountryCode;
}>;


export type ProductAvailabilityDetailsQuery = ProductAvailabilityDetailsQuery_Query;

export type ProductBaseQuery_product_Product_category_Category = { name: string, slug: string };

export type ProductBaseQuery_product_Product_translation_ProductTranslation = { name: string | null, description: string | null };

export type ProductBaseQuery_product_Product = { id: string, name: string, description: string | null, category: ProductBaseQuery_product_Product_category_Category | null, translation: ProductBaseQuery_product_Product_translation_ProductTranslation | null };

export type ProductBaseQuery_Query = { product: ProductBaseQuery_product_Product | null };


export type ProductBaseQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
  channel: Types.Scalars['String']['input'];
  languageCode: Types.LanguageCodeEnum;
}>;


export type ProductBaseQuery = ProductBaseQuery_Query;

export type ProductDetailsQuery_product_Product_media_ProductMedia = { url: string, alt: string, type: Types.ProductMediaType };

export type ProductDetailsQuery_product_Product_variants_ProductVariant_translation_ProductVariantTranslation = { name: string };

export type ProductDetailsQuery_product_Product_variants_ProductVariant_media_ProductMedia = { url: string, alt: string, type: Types.ProductMediaType };

export type ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation = { name: string };

export type ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute = { slug: string | null, inputType: Types.AttributeInputTypeEnum | null, name: string | null, translation: ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation | null };

export type ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation = { name: string, plainText: string | null, richText: string | null };

export type ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File = { url: string };

export type ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue = { slug: string | null, name: string | null, plainText: string | null, richText: string | null, boolean: boolean | null, date: string | null, dateTime: string | null, reference: string | null, value: string | null, translation: ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation | null, file: ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File | null };

export type ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute = { attribute: ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute, values: Array<ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue> };

export type ProductDetailsQuery_product_Product_variants_ProductVariant_nonSelectionAttributes_SelectedAttribute = { attribute: ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute, values: Array<ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue> };

export type ProductDetailsQuery_product_Product_variants_ProductVariant = { id: string, name: string, translation: ProductDetailsQuery_product_Product_variants_ProductVariant_translation_ProductVariantTranslation | null, media: Array<ProductDetailsQuery_product_Product_variants_ProductVariant_media_ProductMedia> | null, selectionAttributes: Array<ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute>, nonSelectionAttributes: Array<ProductDetailsQuery_product_Product_variants_ProductVariant_nonSelectionAttributes_SelectedAttribute> };

export type ProductDetailsQuery_product_Product_attributes_SelectedAttribute_attribute_Attribute = { slug: string | null, inputType: Types.AttributeInputTypeEnum | null, name: string | null, translation: ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation | null };

export type ProductDetailsQuery_product_Product_attributes_SelectedAttribute_values_AttributeValue = { slug: string | null, name: string | null, plainText: string | null, richText: string | null, boolean: boolean | null, date: string | null, dateTime: string | null, reference: string | null, value: string | null, translation: ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation | null, file: ProductDetailsQuery_product_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File | null };

export type ProductDetailsQuery_product_Product_attributes_SelectedAttribute = { attribute: ProductDetailsQuery_product_Product_attributes_SelectedAttribute_attribute_Attribute, values: Array<ProductDetailsQuery_product_Product_attributes_SelectedAttribute_values_AttributeValue> };

export type ProductDetailsQuery_product_Product_category_Category = { name: string, slug: string };

export type ProductDetailsQuery_product_Product_translation_ProductTranslation = { name: string | null, description: string | null };

export type ProductDetailsQuery_product_Product = { id: string, name: string, description: string | null, media: Array<ProductDetailsQuery_product_Product_media_ProductMedia> | null, variants: Array<ProductDetailsQuery_product_Product_variants_ProductVariant> | null, attributes: Array<ProductDetailsQuery_product_Product_attributes_SelectedAttribute>, category: ProductDetailsQuery_product_Product_category_Category | null, translation: ProductDetailsQuery_product_Product_translation_ProductTranslation | null };

export type ProductDetailsQuery_Query = { product: ProductDetailsQuery_product_Product | null };


export type ProductDetailsQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
  channel: Types.Scalars['String']['input'];
  languageCode: Types.LanguageCodeEnum;
  mediaSize: Types.Scalars['Int']['input'];
  mediaFormat: Types.ThumbnailFormatEnum;
}>;


export type ProductDetailsQuery = ProductDetailsQuery_Query;

export type ProductRelatedProductsQuery_product_Product_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_thumbnail_Image = { url: string, alt: string | null };

export type ProductRelatedProductsQuery_product_Product_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney = { net: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money, gross: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money, tax: ProductAvailabilityDetailsQuery_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_tax_Money };

export type ProductRelatedProductsQuery_product_Product_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange = { start: ProductRelatedProductsQuery_product_Product_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney | null };

export type ProductRelatedProductsQuery_product_Product_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo = { priceRange: ProductRelatedProductsQuery_product_Product_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange | null };

export type ProductRelatedProductsQuery_product_Product_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product = { id: string, slug: string, name: string, thumbnail: ProductRelatedProductsQuery_product_Product_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_thumbnail_Image | null, pricing: ProductRelatedProductsQuery_product_Product_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo | null };

export type ProductRelatedProductsQuery_product_Product_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge = { node: ProductRelatedProductsQuery_product_Product_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product };

export type ProductRelatedProductsQuery_product_Product_category_Category_products_ProductCountableConnection = { edges: Array<ProductRelatedProductsQuery_product_Product_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge> };

export type ProductRelatedProductsQuery_product_Product_category_Category = { products: ProductRelatedProductsQuery_product_Product_category_Category_products_ProductCountableConnection | null };

export type ProductRelatedProductsQuery_product_Product = { category: ProductRelatedProductsQuery_product_Product_category_Category | null };

export type ProductRelatedProductsQuery_Query = { product: ProductRelatedProductsQuery_product_Product | null };


export type ProductRelatedProductsQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
  channel: Types.Scalars['String']['input'];
  relatedProducts?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type ProductRelatedProductsQuery = ProductRelatedProductsQuery_Query;

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

export const ProductAvailabilityDetailsQueryDocument = new TypedDocumentString(`
    query ProductAvailabilityDetailsQuery($slug: String!, $channel: String!, $countryCode: CountryCode!) {
  product(slug: $slug, channel: $channel) {
    ...ProductAvailabilityDetailsFragment
  }
}
    fragment ProductAvailabilityDetailsFragment on Product {
  pricing {
    displayGrossPrices
    priceRange {
      start {
        ...TaxedMoneyFragment
      }
    }
  }
  isAvailable(address: {country: $countryCode})
  variantsAvailability: variants {
    id
    quantityLimitPerCustomer
    quantityAvailable(countryCode: $countryCode)
    pricing {
      ...VariantPricingInfoFragment
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
fragment VariantPricingInfoFragment on VariantPricingInfo {
  price {
    ...TaxedMoneyFragment
  }
  priceUndiscounted {
    ...TaxedMoneyFragment
  }
}`) as unknown as TypedDocumentString<ProductAvailabilityDetailsQuery, ProductAvailabilityDetailsQueryVariables>;
export const ProductBaseQueryDocument = new TypedDocumentString(`
    query ProductBaseQuery($slug: String!, $channel: String!, $languageCode: LanguageCodeEnum!) {
  product(slug: $slug, channel: $channel) {
    ...ProductBaseFragment
  }
}
    fragment ProductBaseFragment on Product {
  id
  name
  description
  category {
    name
    slug
  }
  translation(languageCode: $languageCode) {
    name
    description
  }
}`) as unknown as TypedDocumentString<ProductBaseQuery, ProductBaseQueryVariables>;
export const ProductDetailsQueryDocument = new TypedDocumentString(`
    query ProductDetailsQuery($slug: String!, $channel: String!, $languageCode: LanguageCodeEnum!, $mediaSize: Int!, $mediaFormat: ThumbnailFormatEnum!) {
  product(slug: $slug, channel: $channel) {
    ...ProductDetailsFragment
    ...ProductBaseFragment
  }
}
    fragment ProductBaseFragment on Product {
  id
  name
  description
  category {
    name
    slug
  }
  translation(languageCode: $languageCode) {
    name
    description
  }
}
fragment ProductDetailsFragment on Product {
  ...ProductBaseFragment
  media {
    ...ProductMediaFragment
  }
  variants {
    ...ProductVariantDetailsFragment
  }
  attributes {
    attribute {
      ...AttributeFragment
    }
    values {
      ...AttributeValueFragment
    }
  }
}
fragment ProductMediaFragment on ProductMedia {
  url(size: $mediaSize, format: $mediaFormat)
  alt
  type
}
fragment ProductVariantDetailsFragment on ProductVariant {
  id
  name
  translation(languageCode: $languageCode) {
    name
  }
  media {
    ...ProductMediaFragment
  }
  selectionAttributes: attributes(variantSelection: VARIANT_SELECTION) {
    ...SelectionAttributeFragment
  }
  nonSelectionAttributes: attributes(variantSelection: NOT_VARIANT_SELECTION) {
    ...SelectionAttributeFragment
  }
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
}`) as unknown as TypedDocumentString<ProductDetailsQuery, ProductDetailsQueryVariables>;
export const ProductRelatedProductsQueryDocument = new TypedDocumentString(`
    query ProductRelatedProductsQuery($slug: String!, $channel: String!, $relatedProducts: Int = 8) {
  product(slug: $slug, channel: $channel) {
    category {
      products(first: $relatedProducts, channel: $channel) {
        edges {
          node {
            ...ProductRelatedProductsFragment
          }
        }
      }
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
fragment ProductRelatedProductsFragment on Product {
  id
  slug
  name
  thumbnail(size: 512) {
    url
    alt
  }
  pricing {
    ...ProductPricingInfoFragment
  }
}
fragment ProductPricingInfoFragment on ProductPricingInfo {
  priceRange {
    start {
      ...TaxedMoneyFragment
    }
  }
}`) as unknown as TypedDocumentString<ProductRelatedProductsQuery, ProductRelatedProductsQueryVariables>;