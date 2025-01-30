import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_recipient_App_privateMetadata_MetadataItem = { key: string, value: string };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_recipient_App_metadata_MetadataItem = { key: string, value: string };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_recipient_App = { id: string, privateMetadata: Array<TransactionInitializeSessionSubscription_event_TransactionInitializeSession_recipient_App_privateMetadata_MetadataItem>, metadata: Array<TransactionInitializeSessionSubscription_event_TransactionInitializeSession_recipient_App_metadata_MetadataItem> };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_action_TransactionProcessAction = { amount: number, currency: string, actionType: Types.TransactionFlowStrategyEnum };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_issuingPrincipal_App_User = { id: string };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_transaction_TransactionItem = { id: string, pspReference: string };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_channel_Channel = { id: string, slug: string, name: string, currencyCode: string };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_billingAddress_Address_country_CountryDisplay = { country: string, code: string };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_billingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_billingAddress_Address_country_CountryDisplay };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_billingAddress_Address_country_CountryDisplay };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_total_TaxedMoney_gross_Money = { currency: string, amount: number };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_total_TaxedMoney = { gross: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_total_TaxedMoney_gross_Money };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingPrice_TaxedMoney_tax_Money = { currency: string, amount: number };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingPrice_TaxedMoney = { net: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingPrice_TaxedMoney_net_Money, gross: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingPrice_TaxedMoney_gross_Money, tax: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingPrice_TaxedMoney_tax_Money };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_deliveryMethod_ShippingMethod = { id: string, name: string };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order_billingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_billingAddress_Address_country_CountryDisplay };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_billingAddress_Address_country_CountryDisplay };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order_total_TaxedMoney_gross_Money = { currency: string, amount: number };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order_total_TaxedMoney = { gross: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order_total_TaxedMoney_gross_Money };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order_shippingPrice_TaxedMoney = { net: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingPrice_TaxedMoney_net_Money, gross: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingPrice_TaxedMoney_gross_Money, tax: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingPrice_TaxedMoney_tax_Money };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order_deliveryMethod_ShippingMethod = { id: string, name: string };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout = (
  { id: string, languageCode: Types.LanguageCodeEnum, userEmail: string | null, channel: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_channel_Channel, billingAddress: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_billingAddress_Address | null, shippingAddress: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingAddress_Address | null, total: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_total_TaxedMoney, shippingPrice: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingPrice_TaxedMoney, deliveryMethod: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_deliveryMethod_ShippingMethod | null }
  & { __typename: 'Checkout' }
);

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order = (
  { id: string, languageCodeEnum: Types.LanguageCodeEnum, userEmail: string | null, channel: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_channel_Channel, billingAddress: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order_billingAddress_Address | null, shippingAddress: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order_shippingAddress_Address | null, total: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order_total_TaxedMoney, shippingPrice: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order_shippingPrice_TaxedMoney, deliveryMethod: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order_deliveryMethod_ShippingMethod | null }
  & { __typename: 'Order' }
);

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject = TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout | TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order;

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession = { data: unknown | null, merchantReference: string, recipient: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_recipient_App | null, action: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_action_TransactionProcessAction, issuingPrincipal: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_issuingPrincipal_App_User | null, transaction: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_transaction_TransactionItem, sourceObject: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject };

export type TransactionInitializeSessionSubscription_Subscription = { event: TransactionInitializeSessionSubscription_event_TransactionInitializeSession | null };


export type TransactionInitializeSessionSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type TransactionInitializeSessionSubscription = TransactionInitializeSessionSubscription_Subscription;

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

export const TransactionInitializeSessionSubscriptionDocument = new TypedDocumentString(`
    subscription TransactionInitializeSessionSubscription {
  event {
    ... on TransactionInitializeSession {
      recipient {
        ...PaymentGatewayRecipientFragment
      }
      data
      merchantReference
      action {
        amount
        currency
        actionType
      }
      issuingPrincipal {
        ... on Node {
          id
        }
      }
      transaction {
        id
        pspReference
      }
      sourceObject {
        ...OrderOrCheckoutSourceObjectFragment
      }
    }
  }
}
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
}
fragment MoneyFragment on Money {
  currency
  amount
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
}`) as unknown as TypedDocumentString<TransactionInitializeSessionSubscription, TransactionInitializeSessionSubscriptionVariables>;