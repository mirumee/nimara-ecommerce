import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_privateMetadata_MetadataItem = { key: string, value: string };

export type ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_metadata_MetadataItem = { key: string, value: string };

export type ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App = { id: string, privateMetadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_privateMetadata_MetadataItem>, metadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_metadata_MetadataItem> };

export type ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_channel_Channel = { id: string, slug: string, name: string, currencyCode: string };

export type ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_user_User_privateMetadata_MetadataItem = { key: string, value: string };

export type ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_user_User = { id: string, email: string, firstName: string, lastName: string, privateMetadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_user_User_privateMetadata_MetadataItem> };

export type ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods = { recipient: ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App | null, channel: ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_channel_Channel, user: ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_user_User };

export type ListStoredPaymentMethodsSubscription_Subscription = { event: ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods | null };


export type ListStoredPaymentMethodsSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type ListStoredPaymentMethodsSubscription = ListStoredPaymentMethodsSubscription_Subscription;

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_recipient_App = { id: string, privateMetadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_privateMetadata_MetadataItem>, metadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_metadata_MetadataItem> };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_channel_Channel = { id: string, slug: string, name: string, currencyCode: string };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_user_User = { id: string, email: string, firstName: string, lastName: string, privateMetadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_user_User_privateMetadata_MetadataItem> };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_total_TaxedMoney_gross_Money = { currency: string, amount: number };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_total_TaxedMoney = { gross: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_total_TaxedMoney_gross_Money };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_user_User = { id: string, email: string, firstName: string, lastName: string, privateMetadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_user_User_privateMetadata_MetadataItem> };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_channel_Channel = { id: string, slug: string, name: string, currencyCode: string };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney_gross_Money = { currency: string, amount: number };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney = { gross: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney_gross_Money };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout = { id: string, languageCode: Types.LanguageCodeEnum, userEmail: string | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_channel_Channel, user: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_user_User | null, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_total_TaxedMoney };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order = { id: string, languageCodeEnum: Types.LanguageCodeEnum, userEmail: string | null, user: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_user_User | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_channel_Channel, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject =
  | PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout
  | PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order
;

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession = { recipient: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_recipient_App | null, sourceObject: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject };

export type PaymentGatewayInitializeSessionSubscription_Subscription = { event: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession | null };


export type PaymentGatewayInitializeSessionSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type PaymentGatewayInitializeSessionSubscription = PaymentGatewayInitializeSessionSubscription_Subscription;

export type PaymentMethodInitializeTokenizationSessionSubscription_event_PaymentMethodInitializeTokenizationSession_channel_Channel = { id: string, slug: string, name: string, currencyCode: string };

export type PaymentMethodInitializeTokenizationSessionSubscription_event_PaymentMethodInitializeTokenizationSession_user_User = { id: string, email: string, firstName: string, lastName: string, privateMetadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_user_User_privateMetadata_MetadataItem> };

export type PaymentMethodInitializeTokenizationSessionSubscription_event_PaymentMethodInitializeTokenizationSession = { paymentFlowToSupport: Types.TokenizedPaymentFlowEnum, data: unknown | null, channel: PaymentMethodInitializeTokenizationSessionSubscription_event_PaymentMethodInitializeTokenizationSession_channel_Channel, user: PaymentMethodInitializeTokenizationSessionSubscription_event_PaymentMethodInitializeTokenizationSession_user_User };

export type PaymentMethodInitializeTokenizationSessionSubscription_Subscription = { event: PaymentMethodInitializeTokenizationSessionSubscription_event_PaymentMethodInitializeTokenizationSession | null };


export type PaymentMethodInitializeTokenizationSessionSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type PaymentMethodInitializeTokenizationSessionSubscription = PaymentMethodInitializeTokenizationSessionSubscription_Subscription;

export type PaymentMethodProcessTokenizationSessionSubscription_event_PaymentMethodProcessTokenizationSession_channel_Channel = { id: string, slug: string, name: string, currencyCode: string };

export type PaymentMethodProcessTokenizationSessionSubscription_event_PaymentMethodProcessTokenizationSession_user_User = { id: string, email: string, firstName: string, lastName: string, privateMetadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_user_User_privateMetadata_MetadataItem> };

export type PaymentMethodProcessTokenizationSessionSubscription_event_PaymentMethodProcessTokenizationSession = { id: string, data: unknown | null, channel: PaymentMethodProcessTokenizationSessionSubscription_event_PaymentMethodProcessTokenizationSession_channel_Channel, user: PaymentMethodProcessTokenizationSessionSubscription_event_PaymentMethodProcessTokenizationSession_user_User };

export type PaymentMethodProcessTokenizationSessionSubscription_Subscription = { event: PaymentMethodProcessTokenizationSessionSubscription_event_PaymentMethodProcessTokenizationSession | null };


export type PaymentMethodProcessTokenizationSessionSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type PaymentMethodProcessTokenizationSessionSubscription = PaymentMethodProcessTokenizationSessionSubscription_Subscription;

export type StoredPaymentMethodDeleteRequestedSubscription_event_StoredPaymentMethodDeleteRequested_channel_Channel = { id: string, slug: string, name: string, currencyCode: string };

export type StoredPaymentMethodDeleteRequestedSubscription_event_StoredPaymentMethodDeleteRequested_user_User = { id: string, email: string, firstName: string, lastName: string, privateMetadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_user_User_privateMetadata_MetadataItem> };

export type StoredPaymentMethodDeleteRequestedSubscription_event_StoredPaymentMethodDeleteRequested = { paymentMethodId: string, channel: StoredPaymentMethodDeleteRequestedSubscription_event_StoredPaymentMethodDeleteRequested_channel_Channel, user: StoredPaymentMethodDeleteRequestedSubscription_event_StoredPaymentMethodDeleteRequested_user_User };

export type StoredPaymentMethodDeleteRequestedSubscription_Subscription = { event: StoredPaymentMethodDeleteRequestedSubscription_event_StoredPaymentMethodDeleteRequested | null };


export type StoredPaymentMethodDeleteRequestedSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type StoredPaymentMethodDeleteRequestedSubscription = StoredPaymentMethodDeleteRequestedSubscription_Subscription;

export type TransactionCancelationRequestedSubscription_event_TransactionCancelationRequested_recipient_App = { id: string, privateMetadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_privateMetadata_MetadataItem>, metadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_metadata_MetadataItem> };

export type TransactionCancelationRequestedSubscription_event_TransactionCancelationRequested_action_TransactionAction = { actionType: Types.TransactionActionEnum, amount: number, currency: string };

export type TransactionCancelationRequestedSubscription_event_TransactionCancelationRequested_transaction_TransactionItem_sourceObject_Order = { id: string, languageCodeEnum: Types.LanguageCodeEnum, userEmail: string | null, user: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_user_User | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_channel_Channel, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney };

export type TransactionCancelationRequestedSubscription_event_TransactionCancelationRequested_transaction_TransactionItem = { id: string, pspReference: string, sourceObject: TransactionCancelationRequestedSubscription_event_TransactionCancelationRequested_transaction_TransactionItem_sourceObject_Order | null };

export type TransactionCancelationRequestedSubscription_event_TransactionCancelationRequested = { recipient: TransactionCancelationRequestedSubscription_event_TransactionCancelationRequested_recipient_App | null, action: TransactionCancelationRequestedSubscription_event_TransactionCancelationRequested_action_TransactionAction, transaction: TransactionCancelationRequestedSubscription_event_TransactionCancelationRequested_transaction_TransactionItem | null };

export type TransactionCancelationRequestedSubscription_Subscription = { event: TransactionCancelationRequestedSubscription_event_TransactionCancelationRequested | null };


export type TransactionCancelationRequestedSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type TransactionCancelationRequestedSubscription = TransactionCancelationRequestedSubscription_Subscription;

export type TransactionChargeRequestedSubscription_event_TransactionChargeRequested_recipient_App = { id: string, privateMetadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_privateMetadata_MetadataItem>, metadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_metadata_MetadataItem> };

export type TransactionChargeRequestedSubscription_event_TransactionChargeRequested_action_TransactionAction = { actionType: Types.TransactionActionEnum, amount: number, currency: string };

export type TransactionChargeRequestedSubscription_event_TransactionChargeRequested_transaction_TransactionItem_sourceObject_Order = { id: string, languageCodeEnum: Types.LanguageCodeEnum, userEmail: string | null, user: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_user_User | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_channel_Channel, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney };

export type TransactionChargeRequestedSubscription_event_TransactionChargeRequested_transaction_TransactionItem = { id: string, pspReference: string, sourceObject: TransactionChargeRequestedSubscription_event_TransactionChargeRequested_transaction_TransactionItem_sourceObject_Order | null };

export type TransactionChargeRequestedSubscription_event_TransactionChargeRequested = { recipient: TransactionChargeRequestedSubscription_event_TransactionChargeRequested_recipient_App | null, action: TransactionChargeRequestedSubscription_event_TransactionChargeRequested_action_TransactionAction, transaction: TransactionChargeRequestedSubscription_event_TransactionChargeRequested_transaction_TransactionItem | null };

export type TransactionChargeRequestedSubscription_Subscription = { event: TransactionChargeRequestedSubscription_event_TransactionChargeRequested | null };


export type TransactionChargeRequestedSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type TransactionChargeRequestedSubscription = TransactionChargeRequestedSubscription_Subscription;

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_recipient_App = { id: string, privateMetadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_privateMetadata_MetadataItem>, metadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_metadata_MetadataItem> };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_action_TransactionProcessAction = { amount: number, currency: string, actionType: Types.TransactionFlowStrategyEnum };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_transaction_TransactionItem = { id: string, pspReference: string };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingAddress_Address_country_CountryDisplay = { code: string };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingAddress_Address = { firstName: string, lastName: string, streetAddress1: string, streetAddress2: string, city: string, postalCode: string, countryArea: string, phone: string | null, country: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingAddress_Address_country_CountryDisplay };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order_shippingAddress_Address = { firstName: string, lastName: string, streetAddress1: string, streetAddress2: string, city: string, postalCode: string, countryArea: string, phone: string | null, country: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingAddress_Address_country_CountryDisplay };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout = { id: string, languageCode: Types.LanguageCodeEnum, userEmail: string | null, shippingAddress: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout_shippingAddress_Address | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_channel_Channel, user: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_user_User | null, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_total_TaxedMoney };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order = { id: string, languageCodeEnum: Types.LanguageCodeEnum, userEmail: string | null, shippingAddress: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order_shippingAddress_Address | null, user: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_user_User | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_channel_Channel, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject =
  | TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout
  | TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order
;

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession = { data: unknown | null, merchantReference: string, recipient: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_recipient_App | null, action: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_action_TransactionProcessAction, transaction: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_transaction_TransactionItem, sourceObject: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject };

export type TransactionInitializeSessionSubscription_Subscription = { event: TransactionInitializeSessionSubscription_event_TransactionInitializeSession | null };


export type TransactionInitializeSessionSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type TransactionInitializeSessionSubscription = TransactionInitializeSessionSubscription_Subscription;

export type TransactionProcessSessionSubscription_event_TransactionProcessSession_recipient_App = { id: string, privateMetadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_privateMetadata_MetadataItem>, metadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_metadata_MetadataItem> };

export type TransactionProcessSessionSubscription_event_TransactionProcessSession_action_TransactionProcessAction = { amount: number, currency: string, actionType: Types.TransactionFlowStrategyEnum };

export type TransactionProcessSessionSubscription_event_TransactionProcessSession_transaction_TransactionItem = { id: string, pspReference: string };

export type TransactionProcessSessionSubscription_event_TransactionProcessSession_sourceObject_Checkout = { id: string, languageCode: Types.LanguageCodeEnum, userEmail: string | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_channel_Channel, user: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_user_User | null, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_total_TaxedMoney };

export type TransactionProcessSessionSubscription_event_TransactionProcessSession_sourceObject_Order = { id: string, languageCodeEnum: Types.LanguageCodeEnum, userEmail: string | null, user: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_user_User | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_channel_Channel, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney };

export type TransactionProcessSessionSubscription_event_TransactionProcessSession_sourceObject =
  | TransactionProcessSessionSubscription_event_TransactionProcessSession_sourceObject_Checkout
  | TransactionProcessSessionSubscription_event_TransactionProcessSession_sourceObject_Order
;

export type TransactionProcessSessionSubscription_event_TransactionProcessSession = { data: unknown | null, merchantReference: string, recipient: TransactionProcessSessionSubscription_event_TransactionProcessSession_recipient_App | null, action: TransactionProcessSessionSubscription_event_TransactionProcessSession_action_TransactionProcessAction, transaction: TransactionProcessSessionSubscription_event_TransactionProcessSession_transaction_TransactionItem, sourceObject: TransactionProcessSessionSubscription_event_TransactionProcessSession_sourceObject };

export type TransactionProcessSessionSubscription_Subscription = { event: TransactionProcessSessionSubscription_event_TransactionProcessSession | null };


export type TransactionProcessSessionSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type TransactionProcessSessionSubscription = TransactionProcessSessionSubscription_Subscription;

export type TransactionRefundRequestedSubscription_event_TransactionRefundRequested_recipient_App = { id: string, privateMetadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_privateMetadata_MetadataItem>, metadata: Array<ListStoredPaymentMethodsSubscription_event_ListStoredPaymentMethods_recipient_App_metadata_MetadataItem> };

export type TransactionRefundRequestedSubscription_event_TransactionRefundRequested_action_TransactionAction = { actionType: Types.TransactionActionEnum, amount: number, currency: string };

export type TransactionRefundRequestedSubscription_event_TransactionRefundRequested_transaction_TransactionItem_sourceObject_Order = { id: string, languageCodeEnum: Types.LanguageCodeEnum, userEmail: string | null, user: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_user_User | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_channel_Channel, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney };

export type TransactionRefundRequestedSubscription_event_TransactionRefundRequested_transaction_TransactionItem = { id: string, pspReference: string, sourceObject: TransactionRefundRequestedSubscription_event_TransactionRefundRequested_transaction_TransactionItem_sourceObject_Order | null };

export type TransactionRefundRequestedSubscription_event_TransactionRefundRequested = { recipient: TransactionRefundRequestedSubscription_event_TransactionRefundRequested_recipient_App | null, action: TransactionRefundRequestedSubscription_event_TransactionRefundRequested_action_TransactionAction, transaction: TransactionRefundRequestedSubscription_event_TransactionRefundRequested_transaction_TransactionItem | null };

export type TransactionRefundRequestedSubscription_Subscription = { event: TransactionRefundRequestedSubscription_event_TransactionRefundRequested | null };


export type TransactionRefundRequestedSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type TransactionRefundRequestedSubscription = TransactionRefundRequestedSubscription_Subscription;

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

export const ListStoredPaymentMethodsSubscriptionDocument = new TypedDocumentString(`
    subscription ListStoredPaymentMethodsSubscription {
  event {
    ... on ListStoredPaymentMethods {
      recipient {
        ...PaymentGatewayRecipientFragment
      }
      channel {
        ...ChannelFragment
      }
      user {
        ...UserFragment
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
fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment UserFragment on User {
  id
  email
  firstName
  lastName
  privateMetadata {
    key
    value
  }
}`) as unknown as TypedDocumentString<ListStoredPaymentMethodsSubscription, ListStoredPaymentMethodsSubscriptionVariables>;
export const PaymentGatewayInitializeSessionSubscriptionDocument = new TypedDocumentString(`
    subscription PaymentGatewayInitializeSessionSubscription {
  event {
    ... on PaymentGatewayInitializeSession {
      recipient {
        ...PaymentGatewayRecipientFragment
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
fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment UserFragment on User {
  id
  email
  firstName
  lastName
  privateMetadata {
    key
    value
  }
}
fragment OrderOrCheckoutSourceObjectFragment on OrderOrCheckout {
  ... on Checkout {
    ...CheckoutSourceObjectFragment
  }
  ... on Order {
    ...OrderSourceObjectFragment
  }
}
fragment CheckoutSourceObjectFragment on Checkout {
  id
  languageCode
  channel {
    ...ChannelFragment
  }
  user {
    ...UserFragment
  }
  userEmail: email
  total: totalPrice {
    gross {
      ...MoneyFragment
    }
  }
}
fragment MoneyFragment on Money {
  currency
  amount
}
fragment OrderSourceObjectFragment on Order {
  id
  languageCodeEnum
  user {
    ...UserFragment
  }
  userEmail
  channel {
    ...ChannelFragment
  }
  total {
    gross {
      ...MoneyFragment
    }
  }
}`) as unknown as TypedDocumentString<PaymentGatewayInitializeSessionSubscription, PaymentGatewayInitializeSessionSubscriptionVariables>;
export const PaymentMethodInitializeTokenizationSessionSubscriptionDocument = new TypedDocumentString(`
    subscription PaymentMethodInitializeTokenizationSessionSubscription {
  event {
    ... on PaymentMethodInitializeTokenizationSession {
      channel {
        ...ChannelFragment
      }
      user {
        ...UserFragment
      }
      paymentFlowToSupport
      data
    }
  }
}
    fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment UserFragment on User {
  id
  email
  firstName
  lastName
  privateMetadata {
    key
    value
  }
}`) as unknown as TypedDocumentString<PaymentMethodInitializeTokenizationSessionSubscription, PaymentMethodInitializeTokenizationSessionSubscriptionVariables>;
export const PaymentMethodProcessTokenizationSessionSubscriptionDocument = new TypedDocumentString(`
    subscription PaymentMethodProcessTokenizationSessionSubscription {
  event {
    ... on PaymentMethodProcessTokenizationSession {
      channel {
        ...ChannelFragment
      }
      user {
        ...UserFragment
      }
      id
      data
    }
  }
}
    fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment UserFragment on User {
  id
  email
  firstName
  lastName
  privateMetadata {
    key
    value
  }
}`) as unknown as TypedDocumentString<PaymentMethodProcessTokenizationSessionSubscription, PaymentMethodProcessTokenizationSessionSubscriptionVariables>;
export const StoredPaymentMethodDeleteRequestedSubscriptionDocument = new TypedDocumentString(`
    subscription StoredPaymentMethodDeleteRequestedSubscription {
  event {
    ... on StoredPaymentMethodDeleteRequested {
      channel {
        ...ChannelFragment
      }
      user {
        ...UserFragment
      }
      paymentMethodId
    }
  }
}
    fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment UserFragment on User {
  id
  email
  firstName
  lastName
  privateMetadata {
    key
    value
  }
}`) as unknown as TypedDocumentString<StoredPaymentMethodDeleteRequestedSubscription, StoredPaymentMethodDeleteRequestedSubscriptionVariables>;
export const TransactionCancelationRequestedSubscriptionDocument = new TypedDocumentString(`
    subscription TransactionCancelationRequestedSubscription {
  event {
    ... on TransactionCancelationRequested {
      recipient {
        ...PaymentGatewayRecipientFragment
      }
      action {
        ...TransactionActionFragment
      }
      transaction {
        ...TransactionItemFragment
        sourceObject: order {
          ...OrderSourceObjectFragment
        }
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
fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment UserFragment on User {
  id
  email
  firstName
  lastName
  privateMetadata {
    key
    value
  }
}
fragment MoneyFragment on Money {
  currency
  amount
}
fragment OrderSourceObjectFragment on Order {
  id
  languageCodeEnum
  user {
    ...UserFragment
  }
  userEmail
  channel {
    ...ChannelFragment
  }
  total {
    gross {
      ...MoneyFragment
    }
  }
}
fragment TransactionActionFragment on TransactionAction {
  actionType
  amount
  currency
}
fragment TransactionItemFragment on TransactionItem {
  id
  pspReference
}`) as unknown as TypedDocumentString<TransactionCancelationRequestedSubscription, TransactionCancelationRequestedSubscriptionVariables>;
export const TransactionChargeRequestedSubscriptionDocument = new TypedDocumentString(`
    subscription TransactionChargeRequestedSubscription {
  event {
    ... on TransactionChargeRequested {
      recipient {
        ...PaymentGatewayRecipientFragment
      }
      action {
        ...TransactionActionFragment
      }
      transaction {
        ...TransactionItemFragment
        sourceObject: order {
          ...OrderSourceObjectFragment
        }
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
fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment UserFragment on User {
  id
  email
  firstName
  lastName
  privateMetadata {
    key
    value
  }
}
fragment MoneyFragment on Money {
  currency
  amount
}
fragment OrderSourceObjectFragment on Order {
  id
  languageCodeEnum
  user {
    ...UserFragment
  }
  userEmail
  channel {
    ...ChannelFragment
  }
  total {
    gross {
      ...MoneyFragment
    }
  }
}
fragment TransactionActionFragment on TransactionAction {
  actionType
  amount
  currency
}
fragment TransactionItemFragment on TransactionItem {
  id
  pspReference
}`) as unknown as TypedDocumentString<TransactionChargeRequestedSubscription, TransactionChargeRequestedSubscriptionVariables>;
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
        ...TransactionProcessActionFragment
      }
      transaction {
        ...TransactionItemFragment
      }
      sourceObject {
        ...TransactionInitializeSourceObjectFragment
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
fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment UserFragment on User {
  id
  email
  firstName
  lastName
  privateMetadata {
    key
    value
  }
}
fragment CheckoutSourceObjectFragment on Checkout {
  id
  languageCode
  channel {
    ...ChannelFragment
  }
  user {
    ...UserFragment
  }
  userEmail: email
  total: totalPrice {
    gross {
      ...MoneyFragment
    }
  }
}
fragment MoneyFragment on Money {
  currency
  amount
}
fragment OrderSourceObjectFragment on Order {
  id
  languageCodeEnum
  user {
    ...UserFragment
  }
  userEmail
  channel {
    ...ChannelFragment
  }
  total {
    gross {
      ...MoneyFragment
    }
  }
}
fragment TransactionItemFragment on TransactionItem {
  id
  pspReference
}
fragment TransactionProcessActionFragment on TransactionProcessAction {
  amount
  currency
  actionType
}
fragment TransactionInitializeSourceObjectFragment on OrderOrCheckout {
  ... on Checkout {
    ...CheckoutSourceObjectFragment
    shippingAddress {
      ...AddressFragment
    }
  }
  ... on Order {
    ...OrderSourceObjectFragment
    shippingAddress {
      ...AddressFragment
    }
  }
}
fragment AddressFragment on Address {
  firstName
  lastName
  streetAddress1
  streetAddress2
  city
  postalCode
  countryArea
  phone
  country {
    code
  }
}`) as unknown as TypedDocumentString<TransactionInitializeSessionSubscription, TransactionInitializeSessionSubscriptionVariables>;
export const TransactionProcessSessionSubscriptionDocument = new TypedDocumentString(`
    subscription TransactionProcessSessionSubscription {
  event {
    ... on TransactionProcessSession {
      recipient {
        ...PaymentGatewayRecipientFragment
      }
      data
      merchantReference
      action {
        ...TransactionProcessActionFragment
      }
      transaction {
        ...TransactionItemFragment
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
fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment UserFragment on User {
  id
  email
  firstName
  lastName
  privateMetadata {
    key
    value
  }
}
fragment OrderOrCheckoutSourceObjectFragment on OrderOrCheckout {
  ... on Checkout {
    ...CheckoutSourceObjectFragment
  }
  ... on Order {
    ...OrderSourceObjectFragment
  }
}
fragment CheckoutSourceObjectFragment on Checkout {
  id
  languageCode
  channel {
    ...ChannelFragment
  }
  user {
    ...UserFragment
  }
  userEmail: email
  total: totalPrice {
    gross {
      ...MoneyFragment
    }
  }
}
fragment MoneyFragment on Money {
  currency
  amount
}
fragment OrderSourceObjectFragment on Order {
  id
  languageCodeEnum
  user {
    ...UserFragment
  }
  userEmail
  channel {
    ...ChannelFragment
  }
  total {
    gross {
      ...MoneyFragment
    }
  }
}
fragment TransactionItemFragment on TransactionItem {
  id
  pspReference
}
fragment TransactionProcessActionFragment on TransactionProcessAction {
  amount
  currency
  actionType
}`) as unknown as TypedDocumentString<TransactionProcessSessionSubscription, TransactionProcessSessionSubscriptionVariables>;
export const TransactionRefundRequestedSubscriptionDocument = new TypedDocumentString(`
    subscription TransactionRefundRequestedSubscription {
  event {
    ... on TransactionRefundRequested {
      recipient {
        ...PaymentGatewayRecipientFragment
      }
      action {
        ...TransactionActionFragment
      }
      transaction {
        ...TransactionItemFragment
        sourceObject: order {
          ...OrderSourceObjectFragment
        }
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
fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment UserFragment on User {
  id
  email
  firstName
  lastName
  privateMetadata {
    key
    value
  }
}
fragment MoneyFragment on Money {
  currency
  amount
}
fragment OrderSourceObjectFragment on Order {
  id
  languageCodeEnum
  user {
    ...UserFragment
  }
  userEmail
  channel {
    ...ChannelFragment
  }
  total {
    gross {
      ...MoneyFragment
    }
  }
}
fragment TransactionActionFragment on TransactionAction {
  actionType
  amount
  currency
}
fragment TransactionItemFragment on TransactionItem {
  id
  pspReference
}`) as unknown as TypedDocumentString<TransactionRefundRequestedSubscription, TransactionRefundRequestedSubscriptionVariables>;