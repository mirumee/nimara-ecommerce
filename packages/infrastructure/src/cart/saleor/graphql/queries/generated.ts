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

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation = { name: string };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute = { slug: string | null, inputType: Types.AttributeInputTypeEnum | null, name: string | null, translation: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation | null };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation = { name: string, plainText: string | null, richText: string | null };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File = { url: string };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue = { slug: string | null, name: string | null, plainText: string | null, richText: string | null, boolean: boolean | null, date: string | null, dateTime: string | null, reference: string | null, value: string | null, translation: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation | null, file: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File | null };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute = { attribute: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute, values: Array<CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue> };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image = { alt: string | null, url: string };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation = { name: string | null };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product = { id: string, slug: string, name: string, thumbnail: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image | null, translation: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation | null };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney = { net: CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney_net_Money, gross: CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney_gross_Money, tax: CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney_tax_Money };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo = { discount: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney | null };

export type CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant = { id: string, quantityAvailable: number | null, quantityLimitPerCustomer: number | null, name: string, sku: string | null, translation: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation | null, media: Array<CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia> | null, selectionAttributes: Array<CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute>, product: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product, pricing: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo | null };

export type CartQuery_checkout_Checkout_lines_CheckoutLine = { id: string, quantity: number, totalPrice: CartQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CartQuery_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CartQuery_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine = { id: string, quantity: number, totalPrice: CartQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CartQuery_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CartQuery_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine = { id: string, quantity: number, totalPrice: CartQuery_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: CartQuery_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: CartQuery_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CartQuery_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock = (
  { availableQuantity: number | null, line: CartQuery_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemInsufficientStock' }
);

export type CartQuery_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable = (
  { line: CartQuery_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemVariantNotAvailable' }
);

export type CartQuery_checkout_Checkout_problems = CartQuery_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock | CartQuery_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable;

export type CartQuery_checkout_Checkout = { id: string, displayGrossPrices: boolean, subtotalPrice: CartQuery_checkout_Checkout_subtotalPrice_TaxedMoney, totalPrice: CartQuery_checkout_Checkout_totalPrice_TaxedMoney, lines: Array<CartQuery_checkout_Checkout_lines_CheckoutLine>, problems: Array<CartQuery_checkout_Checkout_problems> | null };

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
    ...CheckoutProblemsFragment
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
fragment CheckoutProblemsFragment on CheckoutProblem {
  ... on CheckoutLineProblemInsufficientStock {
    __typename
    availableQuantity
    line {
      ...CartLineFragment
    }
  }
  ... on CheckoutLineProblemVariantNotAvailable {
    __typename
    line {
      ...CartLineFragment
    }
  }
}`) as unknown as TypedDocumentString<CartQuery, CartQueryVariables>;