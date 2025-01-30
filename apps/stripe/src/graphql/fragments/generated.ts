import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type ChannelFragment = { id: string, slug: string, name: string, currencyCode: string };

export type OrderOrCheckoutLineFragment_Checkout_channel_Channel = { id: string, slug: string, name: string, currencyCode: string };

export type OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_tax_Money = { currency: string, amount: number };

export type OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney = { net: OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_net_Money, gross: OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_gross_Money, tax: OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_tax_Money };

export type OrderOrCheckoutLineFragment_Checkout_deliveryMethod_ShippingMethod = { id: string, name: string };

export type OrderOrCheckoutLineFragment_Order_channel_Channel = { id: string, slug: string };

export type OrderOrCheckoutLineFragment_Order_shippingPrice_TaxedMoney = { net: OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_net_Money, gross: OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_gross_Money, tax: OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_tax_Money };

export type OrderOrCheckoutLineFragment_Order_deliveryMethod_ShippingMethod = { id: string, name: string };

export type OrderOrCheckoutLineFragment_Checkout = { channel: OrderOrCheckoutLineFragment_Checkout_channel_Channel, shippingPrice: OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney, deliveryMethod: OrderOrCheckoutLineFragment_Checkout_deliveryMethod_ShippingMethod | null };

export type OrderOrCheckoutLineFragment_Order = { channel: OrderOrCheckoutLineFragment_Order_channel_Channel, shippingPrice: OrderOrCheckoutLineFragment_Order_shippingPrice_TaxedMoney, deliveryMethod: OrderOrCheckoutLineFragment_Order_deliveryMethod_ShippingMethod | null };

export type OrderOrCheckoutLineFragment = OrderOrCheckoutLineFragment_Checkout | OrderOrCheckoutLineFragment_Order;

export type OrderOrCheckoutSourceObjectFragment_Checkout_channel_Channel = { id: string, slug: string, name: string, currencyCode: string };

export type OrderOrCheckoutSourceObjectFragment_Checkout_billingAddress_Address_country_CountryDisplay = { country: string, code: string };

export type OrderOrCheckoutSourceObjectFragment_Checkout_billingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: OrderOrCheckoutSourceObjectFragment_Checkout_billingAddress_Address_country_CountryDisplay };

export type OrderOrCheckoutSourceObjectFragment_Checkout_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: OrderOrCheckoutSourceObjectFragment_Checkout_billingAddress_Address_country_CountryDisplay };

export type OrderOrCheckoutSourceObjectFragment_Checkout_total_TaxedMoney_gross_Money = { currency: string, amount: number };

export type OrderOrCheckoutSourceObjectFragment_Checkout_total_TaxedMoney = { gross: OrderOrCheckoutSourceObjectFragment_Checkout_total_TaxedMoney_gross_Money };

export type OrderOrCheckoutSourceObjectFragment_Order_billingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: OrderOrCheckoutSourceObjectFragment_Checkout_billingAddress_Address_country_CountryDisplay };

export type OrderOrCheckoutSourceObjectFragment_Order_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: OrderOrCheckoutSourceObjectFragment_Checkout_billingAddress_Address_country_CountryDisplay };

export type OrderOrCheckoutSourceObjectFragment_Order_total_TaxedMoney_gross_Money = { currency: string, amount: number };

export type OrderOrCheckoutSourceObjectFragment_Order_total_TaxedMoney = { gross: OrderOrCheckoutSourceObjectFragment_Order_total_TaxedMoney_gross_Money };

export type OrderOrCheckoutSourceObjectFragment_Checkout = (
  { id: string, languageCode: Types.LanguageCodeEnum, userEmail: string | null, channel: OrderOrCheckoutSourceObjectFragment_Checkout_channel_Channel, billingAddress: OrderOrCheckoutSourceObjectFragment_Checkout_billingAddress_Address | null, shippingAddress: OrderOrCheckoutSourceObjectFragment_Checkout_shippingAddress_Address | null, total: OrderOrCheckoutSourceObjectFragment_Checkout_total_TaxedMoney, shippingPrice: OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney, deliveryMethod: OrderOrCheckoutLineFragment_Checkout_deliveryMethod_ShippingMethod | null }
  & { __typename: 'Checkout' }
);

export type OrderOrCheckoutSourceObjectFragment_Order = (
  { id: string, languageCodeEnum: Types.LanguageCodeEnum, userEmail: string | null, channel: OrderOrCheckoutSourceObjectFragment_Checkout_channel_Channel, billingAddress: OrderOrCheckoutSourceObjectFragment_Order_billingAddress_Address | null, shippingAddress: OrderOrCheckoutSourceObjectFragment_Order_shippingAddress_Address | null, total: OrderOrCheckoutSourceObjectFragment_Order_total_TaxedMoney, shippingPrice: OrderOrCheckoutLineFragment_Order_shippingPrice_TaxedMoney, deliveryMethod: OrderOrCheckoutLineFragment_Order_deliveryMethod_ShippingMethod | null }
  & { __typename: 'Order' }
);

export type OrderOrCheckoutSourceObjectFragment = OrderOrCheckoutSourceObjectFragment_Checkout | OrderOrCheckoutSourceObjectFragment_Order;

export type PaymentGatewayRecipientFragment_App_privateMetadata_MetadataItem = { key: string, value: string };

export type PaymentGatewayRecipientFragment_App_metadata_MetadataItem = { key: string, value: string };

export type PaymentGatewayRecipientFragment = { id: string, privateMetadata: Array<PaymentGatewayRecipientFragment_App_privateMetadata_MetadataItem>, metadata: Array<PaymentGatewayRecipientFragment_App_metadata_MetadataItem> };

export type TaxedMoneyFragment = { net: OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_net_Money, gross: OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_gross_Money, tax: OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_tax_Money };

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
export const OrderOrCheckoutSourceObjectFragment = new TypedDocumentString(`
    fragment OrderOrCheckoutSourceObjectFragment on OrderOrCheckout {
  __typename
  ... on Checkout {
    id
    languageCode
    channel {
      ...ChannelFragment
    }
    userEmail: email
    billingAddress {
      ...AddressFragment
    }
    shippingAddress {
      ...AddressFragment
    }
    total: totalPrice {
      gross {
        ...MoneyFragment
      }
    }
    ...OrderOrCheckoutLineFragment
  }
  ... on Order {
    id
    languageCodeEnum
    userEmail
    channel {
      ...ChannelFragment
    }
    billingAddress {
      ...AddressFragment
    }
    shippingAddress {
      ...AddressFragment
    }
    total {
      gross {
        ...MoneyFragment
      }
    }
    ...OrderOrCheckoutLineFragment
  }
}
    fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment OrderOrCheckoutLineFragment on OrderOrCheckout {
  ... on Checkout {
    channel {
      ...ChannelFragment
    }
    shippingPrice {
      ...TaxedMoneyFragment
    }
    deliveryMethod {
      ... on ShippingMethod {
        id
        name
      }
    }
  }
  ... on Order {
    channel {
      id
      slug
    }
    shippingPrice {
      ...TaxedMoneyFragment
    }
    deliveryMethod {
      ... on ShippingMethod {
        id
        name
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
}`, {"fragmentName":"OrderOrCheckoutSourceObjectFragment"}) as unknown as TypedDocumentString<OrderOrCheckoutSourceObjectFragment, unknown>;
export const PaymentGatewayRecipientFragment = new TypedDocumentString(`
    fragment PaymentGatewayRecipientFragment on App {
  id
  privateMetadata {
    key
    value
  }
  metadata {
    key
    value
  }
}
    `, {"fragmentName":"PaymentGatewayRecipientFragment"}) as unknown as TypedDocumentString<PaymentGatewayRecipientFragment, unknown>;