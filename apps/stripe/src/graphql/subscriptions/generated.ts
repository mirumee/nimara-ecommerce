import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_recipient_App_privateMetadata_MetadataItem = { key: string, value: string };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_recipient_App_metadata_MetadataItem = { key: string, value: string };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_recipient_App = { id: string, privateMetadata: Array<PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_recipient_App_privateMetadata_MetadataItem>, metadata: Array<PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_recipient_App_metadata_MetadataItem> };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_channel_Channel = { id: string, slug: string, name: string, currencyCode: string };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_total_TaxedMoney_gross_Money = { currency: string, amount: number };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_total_TaxedMoney = { gross: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_total_TaxedMoney_gross_Money };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_channel_Channel = { id: string, slug: string, name: string, currencyCode: string };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney_gross_Money = { currency: string, amount: number };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney = { gross: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney_gross_Money };

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout = (
  { id: string, languageCode: Types.LanguageCodeEnum, userEmail: string | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_channel_Channel, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_total_TaxedMoney }
  & { __typename: 'Checkout' }
);

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order = (
  { id: string, languageCodeEnum: Types.LanguageCodeEnum, userEmail: string | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_channel_Channel, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney }
  & { __typename: 'Order' }
);

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject = PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout | PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order;

export type PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession = { recipient: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_recipient_App | null, sourceObject: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject };

export type PaymentGatewayInitializeSessionSubscription_Subscription = { event: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession | null };


export type PaymentGatewayInitializeSessionSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type PaymentGatewayInitializeSessionSubscription = PaymentGatewayInitializeSessionSubscription_Subscription;

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_recipient_App = { id: string, privateMetadata: Array<PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_recipient_App_privateMetadata_MetadataItem>, metadata: Array<PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_recipient_App_metadata_MetadataItem> };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_action_TransactionProcessAction = { amount: number, currency: string, actionType: Types.TransactionFlowStrategyEnum };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_transaction_TransactionItem = { id: string, pspReference: string };

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout = (
  { id: string, languageCode: Types.LanguageCodeEnum, userEmail: string | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_channel_Channel, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_total_TaxedMoney }
  & { __typename: 'Checkout' }
);

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order = (
  { id: string, languageCodeEnum: Types.LanguageCodeEnum, userEmail: string | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_channel_Channel, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney }
  & { __typename: 'Order' }
);

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject = TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Checkout | TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject_Order;

export type TransactionInitializeSessionSubscription_event_TransactionInitializeSession = { data: unknown | null, merchantReference: string, recipient: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_recipient_App | null, action: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_action_TransactionProcessAction, transaction: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_transaction_TransactionItem, sourceObject: TransactionInitializeSessionSubscription_event_TransactionInitializeSession_sourceObject };

export type TransactionInitializeSessionSubscription_Subscription = { event: TransactionInitializeSessionSubscription_event_TransactionInitializeSession | null };


export type TransactionInitializeSessionSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type TransactionInitializeSessionSubscription = TransactionInitializeSessionSubscription_Subscription;

export type TransactionProcessSessionSubscription_event_TransactionProcessSession_recipient_App = { id: string, privateMetadata: Array<PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_recipient_App_privateMetadata_MetadataItem>, metadata: Array<PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_recipient_App_metadata_MetadataItem> };

export type TransactionProcessSessionSubscription_event_TransactionProcessSession_action_TransactionProcessAction = { amount: number, currency: string, actionType: Types.TransactionFlowStrategyEnum };

export type TransactionProcessSessionSubscription_event_TransactionProcessSession_transaction_TransactionItem = { id: string, pspReference: string };

export type TransactionProcessSessionSubscription_event_TransactionProcessSession_sourceObject_Checkout = (
  { id: string, languageCode: Types.LanguageCodeEnum, userEmail: string | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_channel_Channel, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Checkout_total_TaxedMoney }
  & { __typename: 'Checkout' }
);

export type TransactionProcessSessionSubscription_event_TransactionProcessSession_sourceObject_Order = (
  { id: string, languageCodeEnum: Types.LanguageCodeEnum, userEmail: string | null, channel: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_channel_Channel, total: PaymentGatewayInitializeSessionSubscription_event_PaymentGatewayInitializeSession_sourceObject_Order_total_TaxedMoney }
  & { __typename: 'Order' }
);

export type TransactionProcessSessionSubscription_event_TransactionProcessSession_sourceObject = TransactionProcessSessionSubscription_event_TransactionProcessSession_sourceObject_Checkout | TransactionProcessSessionSubscription_event_TransactionProcessSession_sourceObject_Order;

export type TransactionProcessSessionSubscription_event_TransactionProcessSession = { data: unknown | null, merchantReference: string, recipient: TransactionProcessSessionSubscription_event_TransactionProcessSession_recipient_App | null, action: TransactionProcessSessionSubscription_event_TransactionProcessSession_action_TransactionProcessAction, transaction: TransactionProcessSessionSubscription_event_TransactionProcessSession_transaction_TransactionItem, sourceObject: TransactionProcessSessionSubscription_event_TransactionProcessSession_sourceObject };

export type TransactionProcessSessionSubscription_Subscription = { event: TransactionProcessSessionSubscription_event_TransactionProcessSession | null };


export type TransactionProcessSessionSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type TransactionProcessSessionSubscription = TransactionProcessSessionSubscription_Subscription;

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
fragment OrderOrCheckoutSourceObjectFragment on OrderOrCheckout {
  __typename
  ... on Checkout {
    id
    languageCode
    channel {
      ...ChannelFragment
    }
    userEmail: email
    total: totalPrice {
      gross {
        ...MoneyFragment
      }
    }
  }
  ... on Order {
    id
    languageCodeEnum
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
}
fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment MoneyFragment on Money {
  currency
  amount
}`) as unknown as TypedDocumentString<PaymentGatewayInitializeSessionSubscription, PaymentGatewayInitializeSessionSubscriptionVariables>;
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
    total: totalPrice {
      gross {
        ...MoneyFragment
      }
    }
  }
  ... on Order {
    id
    languageCodeEnum
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
}
fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment MoneyFragment on Money {
  currency
  amount
}
fragment TransactionProcessActionFragment on TransactionProcessAction {
  amount
  currency
  actionType
}
fragment TransactionItemFragment on TransactionItem {
  id
  pspReference
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
fragment OrderOrCheckoutSourceObjectFragment on OrderOrCheckout {
  __typename
  ... on Checkout {
    id
    languageCode
    channel {
      ...ChannelFragment
    }
    userEmail: email
    total: totalPrice {
      gross {
        ...MoneyFragment
      }
    }
  }
  ... on Order {
    id
    languageCodeEnum
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
}
fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment MoneyFragment on Money {
  currency
  amount
}
fragment TransactionProcessActionFragment on TransactionProcessAction {
  amount
  currency
  actionType
}
fragment TransactionItemFragment on TransactionItem {
  id
  pspReference
}`) as unknown as TypedDocumentString<TransactionProcessSessionSubscription, TransactionProcessSessionSubscriptionVariables>;