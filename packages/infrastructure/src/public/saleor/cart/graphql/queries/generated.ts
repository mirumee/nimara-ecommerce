import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney_tax_Money = { currency: string, amount: number };

export type CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney = { net: CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney_net_Money, gross: CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney_gross_Money, tax: CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney_tax_Money };

export type CartQuery_checkout_Checkout_totalPrice_TaxedMoney = { net: CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney_net_Money, gross: CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney_gross_Money, tax: CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney_tax_Money };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney = { net: CartQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_net_Money, gross: CartQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_gross_Money };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money = { amount: number, currency: string };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation = { name: string };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia = { url: string, alt: string };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image = { alt: string | null, url: string };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation = { name: string | null };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product = { id: string, slug: string, name: string, thumbnail: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image | null, translation: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation | null };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant = { id: string, quantityAvailable: number | null, quantityLimitPerCustomer: number | null, name: string, sku: string | null, translation: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation | null, media: Array<CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia> | null, product: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product };

export type CartQuery_checkout_Checkout_lines_CheckoutLine = { id: string, quantity: number, totalPrice: CartQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CartQuery_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CartQuery_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine = { id: string, quantity: number, totalPrice: CartQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CartQuery_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CartQuery_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock = { availableQuantity: number | null, line: CartQuery_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine };

export type CartQuery_checkout_Checkout = { id: string, displayGrossPrices: boolean, subtotalPrice: CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney, totalPrice: CartQuery_checkout_Checkout_totalPrice_TaxedMoney, lines: Array<CartQuery_checkout_Checkout_lines_CheckoutLine>, problems: Array<CartQuery_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock> | null };

export type CartQuery_Query = { checkout: CartQuery_checkout_Checkout | null };


export type CartQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  countryCode: Types.CountryCode;
  languageCode: Types.LanguageCodeEnum;
  thumbnailSize: Types.Scalars['Int']['input'];
  thumbnailFormat: Types.ThumbnailFormatEnum;
}>;


export type CartQuery = CartQuery_Query;

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

export const CartQueryDocument = new TypedDocumentString(`
    query CartQuery($id: ID!, $countryCode: CountryCode!, $languageCode: LanguageCodeEnum!, $thumbnailSize: Int!, $thumbnailFormat: ThumbnailFormatEnum!) {
  checkout(id: $id) {
    ...CartFragment
  }
}
    fragment CartFragment on Checkout {
  id
  displayGrossPrices
  subtotalPrice {
    ...TaxedMoneyFragment
  }
  totalPrice {
    ...TaxedMoneyFragment
  }
  lines {
    ...CartLineFragment
  }
  problems {
    ... on CheckoutLineProblemInsufficientStock {
      availableQuantity
      line {
        ...CartLineFragment
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
}`) as unknown as TypedDocumentString<CartQuery, CartQueryVariables>;