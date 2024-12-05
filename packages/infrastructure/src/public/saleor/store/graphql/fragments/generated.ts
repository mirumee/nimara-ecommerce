import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AttributeFragment_Attribute_translation_AttributeTranslation = { name: string };

export type AttributeFragment = { slug: string | null, inputType: Types.AttributeInputTypeEnum | null, name: string | null, translation: AttributeFragment_Attribute_translation_AttributeTranslation | null };

export type AttributeValueFragment_AttributeValue_translation_AttributeValueTranslation = { name: string, plainText: string | null, richText: string | null };

export type AttributeValueFragment_AttributeValue_file_File = { url: string };

export type AttributeValueFragment = { slug: string | null, name: string | null, plainText: string | null, richText: string | null, boolean: boolean | null, date: string | null, dateTime: string | null, reference: string | null, value: string | null, translation: AttributeValueFragment_AttributeValue_translation_AttributeValueTranslation | null, file: AttributeValueFragment_AttributeValue_file_File | null };

export type ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money = { currency: string, amount: number };

export type ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money = { currency: string, amount: number };

export type ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_tax_Money = { currency: string, amount: number };

export type ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney = { net: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money, gross: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money, tax: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_tax_Money };

export type ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange = { start: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney | null };

export type ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo = { displayGrossPrices: boolean, priceRange: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange | null };

export type ProductAvailabilityDetailsFragment_Product_variantsAvailability_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney = { net: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money, gross: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money, tax: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_tax_Money };

export type ProductAvailabilityDetailsFragment_Product_variantsAvailability_ProductVariant_pricing_VariantPricingInfo_priceUndiscounted_TaxedMoney = { net: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money, gross: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money, tax: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_tax_Money };

export type ProductAvailabilityDetailsFragment_Product_variantsAvailability_ProductVariant_pricing_VariantPricingInfo = { price: ProductAvailabilityDetailsFragment_Product_variantsAvailability_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney | null, priceUndiscounted: ProductAvailabilityDetailsFragment_Product_variantsAvailability_ProductVariant_pricing_VariantPricingInfo_priceUndiscounted_TaxedMoney | null };

export type ProductAvailabilityDetailsFragment_Product_variantsAvailability_ProductVariant = { id: string, quantityLimitPerCustomer: number | null, quantityAvailable: number | null, pricing: ProductAvailabilityDetailsFragment_Product_variantsAvailability_ProductVariant_pricing_VariantPricingInfo | null };

export type ProductAvailabilityDetailsFragment = { isAvailable: boolean | null, pricing: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo | null, variantsAvailability: Array<ProductAvailabilityDetailsFragment_Product_variantsAvailability_ProductVariant> | null };

export type ProductDetailsFragment_Product_translation_ProductTranslation = { name: string | null, description: string | null };

export type ProductDetailsFragment_Product_media_ProductMedia = { url: string, alt: string, type: Types.ProductMediaType };

export type ProductDetailsFragment_Product_variants_ProductVariant_translation_ProductVariantTranslation = { name: string };

export type ProductDetailsFragment_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute = { slug: string | null, inputType: Types.AttributeInputTypeEnum | null, name: string | null, translation: AttributeFragment_Attribute_translation_AttributeTranslation | null };

export type ProductDetailsFragment_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue = { slug: string | null, name: string | null, plainText: string | null, richText: string | null, boolean: boolean | null, date: string | null, dateTime: string | null, reference: string | null, value: string | null, translation: AttributeValueFragment_AttributeValue_translation_AttributeValueTranslation | null, file: AttributeValueFragment_AttributeValue_file_File | null };

export type ProductDetailsFragment_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute = { attribute: ProductDetailsFragment_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute, values: Array<ProductDetailsFragment_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue> };

export type ProductDetailsFragment_Product_variants_ProductVariant_nonSelectionAttributes_SelectedAttribute = { attribute: ProductDetailsFragment_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute, values: Array<ProductDetailsFragment_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue> };

export type ProductDetailsFragment_Product_variants_ProductVariant = { id: string, name: string, translation: ProductDetailsFragment_Product_variants_ProductVariant_translation_ProductVariantTranslation | null, selectionAttributes: Array<ProductDetailsFragment_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute>, nonSelectionAttributes: Array<ProductDetailsFragment_Product_variants_ProductVariant_nonSelectionAttributes_SelectedAttribute> };

export type ProductDetailsFragment = { id: string, name: string, description: string | null, translation: ProductDetailsFragment_Product_translation_ProductTranslation | null, media: Array<ProductDetailsFragment_Product_media_ProductMedia> | null, variants: Array<ProductDetailsFragment_Product_variants_ProductVariant> | null };

export type ProductMediaFragment = { url: string, alt: string, type: Types.ProductMediaType };

export type ProductVariantDetailsFragment = { id: string, name: string, translation: ProductDetailsFragment_Product_variants_ProductVariant_translation_ProductVariantTranslation | null, selectionAttributes: Array<ProductDetailsFragment_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute>, nonSelectionAttributes: Array<ProductDetailsFragment_Product_variants_ProductVariant_nonSelectionAttributes_SelectedAttribute> };

export type SelectionAttributeFragment = { attribute: ProductDetailsFragment_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute, values: Array<ProductDetailsFragment_Product_variants_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue> };

export type TaxedMoneyFragment = { net: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money, gross: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money, tax: ProductAvailabilityDetailsFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_tax_Money };

export type VariantPricingInfoFragment = { price: ProductAvailabilityDetailsFragment_Product_variantsAvailability_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney | null, priceUndiscounted: ProductAvailabilityDetailsFragment_Product_variantsAvailability_ProductVariant_pricing_VariantPricingInfo_priceUndiscounted_TaxedMoney | null };

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
export const ProductAvailabilityDetailsFragment = new TypedDocumentString(`
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
fragment VariantPricingInfoFragment on VariantPricingInfo {
  price {
    ...TaxedMoneyFragment
  }
  priceUndiscounted {
    ...TaxedMoneyFragment
  }
}
fragment MoneyFragment on Money {
  currency
  amount
}`, {"fragmentName":"ProductAvailabilityDetailsFragment"}) as unknown as TypedDocumentString<ProductAvailabilityDetailsFragment, unknown>;
export const ProductDetailsFragment = new TypedDocumentString(`
    fragment ProductDetailsFragment on Product {
  id
  name
  translation(languageCode: $languageCode) {
    name
  }
  description
  translation(languageCode: $languageCode) {
    name
    description
  }
  media {
    ...ProductMediaFragment
  }
  variants {
    ...ProductVariantDetailsFragment
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
}`, {"fragmentName":"ProductDetailsFragment"}) as unknown as TypedDocumentString<ProductDetailsFragment, unknown>;