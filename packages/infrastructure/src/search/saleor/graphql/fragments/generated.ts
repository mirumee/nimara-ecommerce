import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type SearchProductFragment_Product_translation_ProductTranslation = { name: string | null };

export type SearchProductFragment_Product_thumbnail_Image = { url: string, alt: string | null };

export type SearchProductFragment_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money = { amount: number };

export type SearchProductFragment_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney = { gross: SearchProductFragment_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money };

export type SearchProductFragment_Product_variants_ProductVariant_pricing_VariantPricingInfo = { price: SearchProductFragment_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney | null };

export type SearchProductFragment_Product_variants_ProductVariant = { pricing: SearchProductFragment_Product_variants_ProductVariant_pricing_VariantPricingInfo | null };

export type SearchProductFragment_Product_media_ProductMedia = { url: string, alt: string };

export type SearchProductFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money = { amount: number };

export type SearchProductFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money = { amount: number };

export type SearchProductFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney = { currency: string, gross: SearchProductFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money, net: SearchProductFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_net_Money };

export type SearchProductFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_gross_Money = { amount: number };

export type SearchProductFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_net_Money = { amount: number };

export type SearchProductFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney = { currency: string, gross: SearchProductFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_gross_Money, net: SearchProductFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_net_Money };

export type SearchProductFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange = { start: SearchProductFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney | null, stop: SearchProductFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney | null };

export type SearchProductFragment_Product_pricing_ProductPricingInfo = { priceRange: SearchProductFragment_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange | null };

export type SearchProductFragment = { id: string, name: string, slug: string, updatedAt: string, translation: SearchProductFragment_Product_translation_ProductTranslation | null, thumbnail: SearchProductFragment_Product_thumbnail_Image | null, variants: Array<SearchProductFragment_Product_variants_ProductVariant> | null, media: Array<SearchProductFragment_Product_media_ProductMedia> | null, pricing: SearchProductFragment_Product_pricing_ProductPricingInfo | null };

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
export const SearchProductFragment = new TypedDocumentString(`
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
    `, {"fragmentName":"SearchProductFragment"}) as unknown as TypedDocumentString<SearchProductFragment, unknown>;