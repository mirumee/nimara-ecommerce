import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CheckoutSessionFragment_Checkout_user_User = { firstName: string, lastName: string, email: string };

export type CheckoutSessionFragment_Checkout_deliveryMethod_ShippingMethod_Warehouse = (
  { id: string, name: string }
  & { __typename: 'ShippingMethod' | 'Warehouse' }
);

export type CheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant = { id: string };

export type CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_tax_Money = { currency: string, amount: number };

export type CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney = { net: CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_net_Money, gross: CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_gross_Money, tax: CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_tax_Money };

export type CheckoutSessionFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney = { net: CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_net_Money, gross: CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_gross_Money, tax: CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_tax_Money };

export type CheckoutSessionFragment_Checkout_lines_CheckoutLine = { id: string, quantity: number, variant: CheckoutSessionFragment_Checkout_lines_CheckoutLine_variant_ProductVariant, unitPrice: CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney, totalPrice: CheckoutSessionFragment_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney };

export type CheckoutSessionFragment_Checkout_billingAddress_Address_country_CountryDisplay = { country: string, code: string };

export type CheckoutSessionFragment_Checkout_billingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: CheckoutSessionFragment_Checkout_billingAddress_Address_country_CountryDisplay };

export type CheckoutSessionFragment_Checkout_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: CheckoutSessionFragment_Checkout_billingAddress_Address_country_CountryDisplay };

export type CheckoutSessionFragment_Checkout_shippingMethods_ShippingMethod = { id: string, name: string };

export type CheckoutSessionFragment_Checkout_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type CheckoutSessionFragment_Checkout_totalPrice_TaxedMoney = { currency: string, net: CheckoutSessionFragment_Checkout_totalPrice_TaxedMoney_net_Money, gross: CheckoutSessionFragment_Checkout_totalPrice_TaxedMoney_net_Money, tax: CheckoutSessionFragment_Checkout_totalPrice_TaxedMoney_net_Money };

export type CheckoutSessionFragment_Checkout_subtotalPrice_TaxedMoney = { currency: string, net: CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_net_Money, gross: CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_gross_Money, tax: CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_tax_Money };

export type CheckoutSessionFragment_Checkout_shippingPrice_TaxedMoney = { net: CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_net_Money, gross: CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_gross_Money, tax: CheckoutSessionFragment_Checkout_lines_CheckoutLine_unitPrice_TaxedMoney_tax_Money };

export type CheckoutSessionFragment_Checkout_discount_Money = { currency: string, amount: number };

export type CheckoutSessionFragment = { id: string, chargeStatus: Types.CheckoutChargeStatusEnum, authorizeStatus: Types.CheckoutAuthorizeStatusEnum, user: CheckoutSessionFragment_Checkout_user_User | null, deliveryMethod: CheckoutSessionFragment_Checkout_deliveryMethod_ShippingMethod_Warehouse | null, lines: Array<CheckoutSessionFragment_Checkout_lines_CheckoutLine>, billingAddress: CheckoutSessionFragment_Checkout_billingAddress_Address | null, shippingAddress: CheckoutSessionFragment_Checkout_shippingAddress_Address | null, shippingMethods: Array<CheckoutSessionFragment_Checkout_shippingMethods_ShippingMethod>, totalPrice: CheckoutSessionFragment_Checkout_totalPrice_TaxedMoney, subtotalPrice: CheckoutSessionFragment_Checkout_subtotalPrice_TaxedMoney, shippingPrice: CheckoutSessionFragment_Checkout_shippingPrice_TaxedMoney, discount: CheckoutSessionFragment_Checkout_discount_Money | null };

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
  authorizeStatus
  user {
    firstName
    lastName
    email
  }
  deliveryMethod {
    __typename
    ... on ShippingMethod {
      id
      name
    }
    ... on Warehouse {
      id
      name
    }
  }
  lines {
    id
    quantity
    variant {
      id
    }
    unitPrice {
      ...TaxedMoneyFragment
    }
    totalPrice {
      ...TaxedMoneyFragment
    }
  }
  billingAddress {
    ...AddressFragment
  }
  shippingAddress {
    ...AddressFragment
  }
  shippingMethods {
    id
    name
  }
  totalPrice {
    currency
    ...TaxedMoneyFragment
  }
  subtotalPrice {
    currency
    ...TaxedMoneyFragment
  }
  shippingPrice {
    ...TaxedMoneyFragment
  }
  discount {
    ...MoneyFragment
  }
  totalPrice {
    ...TaxedMoneyFragment
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
fragment AddressFragment on Address {
  id
  city
  phone
  postalCode
  companyName
  cityArea
  streetAddress1
  streetAddress2
  countryArea
  country {
    country
    code
  }
  firstName
  lastName
  isDefaultShippingAddress
  isDefaultBillingAddress
}`, {"fragmentName":"CheckoutSessionFragment"}) as unknown as TypedDocumentString<CheckoutSessionFragment, unknown>;
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