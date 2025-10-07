import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CheckoutSessionFragment_Checkout_user_User_addresses_Address = { phone: string | null };

export type CheckoutSessionFragment_Checkout_user_User = { firstName: string, lastName: string, email: string, addresses: Array<CheckoutSessionFragment_Checkout_user_User_addresses_Address> };

export type CheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant = { id: string };

export type CheckoutSessionFragment_Checkout_lines_CheckoutLine = { id: string, quantity: number, variant: CheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type CheckoutSessionFragment_Checkout_shippingMethods_ShippingMethod = { id: string, name: string };

export type CheckoutSessionFragment_Checkout_totalPrice_TaxedMoney_gross_Money = { amount: number };

export type CheckoutSessionFragment_Checkout_totalPrice_TaxedMoney_net_Money = { amount: number };

export type CheckoutSessionFragment_Checkout_totalPrice_TaxedMoney_tax_Money = { amount: number };

export type CheckoutSessionFragment_Checkout_totalPrice_TaxedMoney = { currency: string, gross: CheckoutSessionFragment_Checkout_totalPrice_TaxedMoney_gross_Money, net: CheckoutSessionFragment_Checkout_totalPrice_TaxedMoney_net_Money, tax: CheckoutSessionFragment_Checkout_totalPrice_TaxedMoney_tax_Money };

export type CheckoutSessionFragment = { id: string, chargeStatus: Types.CheckoutChargeStatusEnum, user: CheckoutSessionFragment_Checkout_user_User | null, lines: Array<CheckoutSessionFragment_Checkout_lines_CheckoutLine>, shippingMethods: Array<CheckoutSessionFragment_Checkout_shippingMethods_ShippingMethod>, totalPrice: CheckoutSessionFragment_Checkout_totalPrice_TaxedMoney };

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
export const CheckoutSessionFragment = new TypedDocumentString(`
    fragment CheckoutSessionFragment on Checkout {
  id
  chargeStatus
  user {
    firstName
    lastName
    email
    addresses {
      phone
    }
  }
  lines {
    id
    quantity
    variant {
      id
    }
  }
  shippingMethods {
    id
    name
  }
  totalPrice {
    currency
    gross {
      amount
    }
    net {
      amount
    }
    tax {
      amount
    }
  }
}
    `, {"fragmentName":"CheckoutSessionFragment"}) as unknown as TypedDocumentString<CheckoutSessionFragment, unknown>;
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