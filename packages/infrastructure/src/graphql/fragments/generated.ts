import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CartLineFragment_CheckoutLine_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type CartLineFragment_CheckoutLine_totalPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CartLineFragment_CheckoutLine_totalPrice_TaxedMoney = { net: CartLineFragment_CheckoutLine_totalPrice_TaxedMoney_net_Money, gross: CartLineFragment_CheckoutLine_totalPrice_TaxedMoney_gross_Money };

export type CartLineFragment_CheckoutLine_undiscountedTotalPrice_Money = { amount: number, currency: string };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation = { name: string };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_media_ProductMedia = { url: string, alt: string };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation = { name: string };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute = { slug: string | null, inputType: Types.AttributeInputTypeEnum | null, name: string | null, translation: CartLineFragment_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation | null };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation = { name: string, plainText: string | null, richText: string | null };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File = { url: string };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue = { slug: string | null, name: string | null, plainText: string | null, richText: string | null, boolean: boolean | null, date: string | null, dateTime: string | null, reference: string | null, value: string | null, translation: CartLineFragment_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation | null, file: CartLineFragment_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File | null };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute = { attribute: CartLineFragment_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute, values: Array<CartLineFragment_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue> };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image = { alt: string | null, url: string };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation = { name: string | null };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_product_Product = { id: string, slug: string, name: string, thumbnail: CartLineFragment_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image | null, translation: CartLineFragment_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation | null };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money = { currency: string, amount: number };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money = { currency: string, amount: number };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney = { net: CartLineFragment_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: CartLineFragment_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: CartLineFragment_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo = { discount: CartLineFragment_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney | null };

export type CartLineFragment_CheckoutLine_variant_ProductVariant = { id: string, quantityAvailable: number | null, quantityLimitPerCustomer: number | null, name: string, sku: string | null, translation: CartLineFragment_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation | null, media: Array<CartLineFragment_CheckoutLine_variant_ProductVariant_media_ProductMedia> | null, selectionAttributes: Array<CartLineFragment_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute>, product: CartLineFragment_CheckoutLine_variant_ProductVariant_product_Product, pricing: CartLineFragment_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo | null };

export type CartLineFragment = { id: string, quantity: number, totalPrice: CartLineFragment_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CartLineFragment_CheckoutLine_undiscountedTotalPrice_Money, variant: CartLineFragment_CheckoutLine_variant_ProductVariant };

export type PaymentGatewayConfigFragment_PaymentGatewayConfig_errors_PaymentGatewayConfigError = { field: string | null, message: string | null, code: Types.PaymentGatewayConfigErrorCode };

export type PaymentGatewayConfigFragment = { id: string, data: unknown | null, errors: Array<PaymentGatewayConfigFragment_PaymentGatewayConfig_errors_PaymentGatewayConfigError> | null };

export type MetadataErrorFragment = { field: string | null, code: Types.MetadataErrorCode, message: string | null };

export type MetadataItemFragment = { key: string, value: string };

export type MoneyFragment = { currency: string, amount: number };

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
export const CartLineFragment = new TypedDocumentString(`
    fragment CartLineFragment on CheckoutLine {
  id
  quantity
  totalPrice {
    net {
      ...MoneyFragment
    }
    gross {
      ...MoneyFragment
    }
  }
  undiscountedTotalPrice {
    amount
    currency
  }
  variant {
    id
    quantityAvailable(countryCode: $countryCode)
    quantityLimitPerCustomer
    name
    sku
    translation(languageCode: $languageCode) {
      name
    }
    media {
      url(size: $thumbnailSize, format: $thumbnailFormat)
      alt
    }
    selectionAttributes: attributes(variantSelection: VARIANT_SELECTION) {
      ...SelectionAttributeFragment
    }
    product {
      id
      slug
      thumbnail(size: $thumbnailSize, format: $thumbnailFormat) {
        alt
        url
      }
      name
      translation(languageCode: $languageCode) {
        name
      }
    }
    pricing {
      discount {
        ...TaxedMoneyFragment
      }
    }
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
}`, {"fragmentName":"CartLineFragment"}) as unknown as TypedDocumentString<CartLineFragment, unknown>;
export const PaymentGatewayConfigFragment = new TypedDocumentString(`
    fragment PaymentGatewayConfigFragment on PaymentGatewayConfig {
  id
  data
  errors {
    field
    message
    code
  }
}
    `, {"fragmentName":"PaymentGatewayConfigFragment"}) as unknown as TypedDocumentString<PaymentGatewayConfigFragment, unknown>;
export const MetadataErrorFragment = new TypedDocumentString(`
    fragment MetadataErrorFragment on MetadataError {
  field
  code
  message
}
    `, {"fragmentName":"MetadataErrorFragment"}) as unknown as TypedDocumentString<MetadataErrorFragment, unknown>;
export const MetadataItemFragment = new TypedDocumentString(`
    fragment MetadataItemFragment on MetadataItem {
  key
  value
}
    `, {"fragmentName":"MetadataItemFragment"}) as unknown as TypedDocumentString<MetadataItemFragment, unknown>;