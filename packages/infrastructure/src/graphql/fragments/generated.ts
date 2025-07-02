import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CartLineFragment_CheckoutLine_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type CartLineFragment_CheckoutLine_totalPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CartLineFragment_CheckoutLine_totalPrice_TaxedMoney = { net: CartLineFragment_CheckoutLine_totalPrice_TaxedMoney_net_Money, gross: CartLineFragment_CheckoutLine_totalPrice_TaxedMoney_gross_Money };

export type CartLineFragment_CheckoutLine_undiscountedTotalPrice_Money = { amount: number, currency: string };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation = { name: string };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_media_ProductMedia = { url: string, alt: string };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image = { alt: string | null, url: string };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation = { name: string | null };

export type CartLineFragment_CheckoutLine_variant_ProductVariant_product_Product = { id: string, slug: string, name: string, thumbnail: CartLineFragment_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image | null, translation: CartLineFragment_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation | null };

export type CartLineFragment_CheckoutLine_variant_ProductVariant = { id: string, quantityAvailable: number | null, quantityLimitPerCustomer: number | null, name: string, sku: string | null, translation: CartLineFragment_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation | null, media: Array<CartLineFragment_CheckoutLine_variant_ProductVariant_media_ProductMedia> | null, product: CartLineFragment_CheckoutLine_variant_ProductVariant_product_Product };

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
  }
}
    fragment MoneyFragment on Money {
  currency
  amount
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