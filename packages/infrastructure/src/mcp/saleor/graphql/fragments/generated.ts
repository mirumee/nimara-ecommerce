import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CheckoutSession_Checkout_lines_CheckoutLine = { id: string, quantity: number };

export type CheckoutSession = { id: string, lines: Array<CheckoutSession_Checkout_lines_CheckoutLine> };

export type ProductFeedFragment_Product_media_ProductMedia = { url: string };

export type ProductFeedFragment_Product_attributes_SelectedAttribute_attribute_Attribute = { id: string, name: string | null };

export type ProductFeedFragment_Product_attributes_SelectedAttribute_values_AttributeValue = { id: string, name: string | null, value: string | null };

export type ProductFeedFragment_Product_attributes_SelectedAttribute = { attribute: ProductFeedFragment_Product_attributes_SelectedAttribute_attribute_Attribute, values: Array<ProductFeedFragment_Product_attributes_SelectedAttribute_values_AttributeValue> };

export type ProductFeedFragment_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money = { amount: number, currency: string };

export type ProductFeedFragment_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney = { gross: ProductFeedFragment_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money };

export type ProductFeedFragment_Product_variants_ProductVariant_pricing_VariantPricingInfo = { price: ProductFeedFragment_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney | null };

export type ProductFeedFragment_Product_variants_ProductVariant_attributes_SelectedAttribute_attribute_Attribute = { id: string, name: string | null };

export type ProductFeedFragment_Product_variants_ProductVariant_attributes_SelectedAttribute_values_AttributeValue = { id: string, name: string | null, value: string | null };

export type ProductFeedFragment_Product_variants_ProductVariant_attributes_SelectedAttribute = { attribute: ProductFeedFragment_Product_variants_ProductVariant_attributes_SelectedAttribute_attribute_Attribute, values: Array<ProductFeedFragment_Product_variants_ProductVariant_attributes_SelectedAttribute_values_AttributeValue> };

export type ProductFeedFragment_Product_variants_ProductVariant = { id: string, sku: string | null, quantityAvailable: number | null, pricing: ProductFeedFragment_Product_variants_ProductVariant_pricing_VariantPricingInfo | null, attributes: Array<ProductFeedFragment_Product_variants_ProductVariant_attributes_SelectedAttribute> };

export type ProductFeedFragment = { id: string, name: string, slug: string, description: string | null, media: Array<ProductFeedFragment_Product_media_ProductMedia> | null, attributes: Array<ProductFeedFragment_Product_attributes_SelectedAttribute>, variants: Array<ProductFeedFragment_Product_variants_ProductVariant> | null };

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
export const CheckoutSession = new TypedDocumentString(`
    fragment CheckoutSession on Checkout {
  id
  lines {
    id
    quantity
  }
}
    `, {"fragmentName":"CheckoutSession"}) as unknown as TypedDocumentString<CheckoutSession, unknown>;
export const ProductFeedFragment = new TypedDocumentString(`
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
}
    `, {"fragmentName":"ProductFeedFragment"}) as unknown as TypedDocumentString<ProductFeedFragment, unknown>;