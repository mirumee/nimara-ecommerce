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

export type OrderOrCheckoutSourceObjectFragment_Checkout_total_TaxedMoney_gross_Money = { currency: string, amount: number };

export type OrderOrCheckoutSourceObjectFragment_Checkout_total_TaxedMoney = { gross: OrderOrCheckoutSourceObjectFragment_Checkout_total_TaxedMoney_gross_Money };

export type OrderOrCheckoutSourceObjectFragment_Order_channel_Channel = { id: string, slug: string, name: string, currencyCode: string };

export type OrderOrCheckoutSourceObjectFragment_Order_total_TaxedMoney_gross_Money = { currency: string, amount: number };

export type OrderOrCheckoutSourceObjectFragment_Order_total_TaxedMoney = { gross: OrderOrCheckoutSourceObjectFragment_Order_total_TaxedMoney_gross_Money };

export type OrderOrCheckoutSourceObjectFragment_Checkout = (
  { id: string, languageCode: Types.LanguageCodeEnum, userEmail: string | null, channel: OrderOrCheckoutSourceObjectFragment_Checkout_channel_Channel, total: OrderOrCheckoutSourceObjectFragment_Checkout_total_TaxedMoney }
  & { __typename: 'Checkout' }
);

export type OrderOrCheckoutSourceObjectFragment_Order = (
  { id: string, languageCodeEnum: Types.LanguageCodeEnum, userEmail: string | null, channel: OrderOrCheckoutSourceObjectFragment_Order_channel_Channel, total: OrderOrCheckoutSourceObjectFragment_Order_total_TaxedMoney }
  & { __typename: 'Order' }
);

export type OrderOrCheckoutSourceObjectFragment = OrderOrCheckoutSourceObjectFragment_Checkout | OrderOrCheckoutSourceObjectFragment_Order;

export type PaymentGatewayRecipientFragment_App_privateMetadata_MetadataItem = { key: string, value: string };

export type PaymentGatewayRecipientFragment_App_metadata_MetadataItem = { key: string, value: string };

export type PaymentGatewayRecipientFragment = { id: string, privateMetadata: Array<PaymentGatewayRecipientFragment_App_privateMetadata_MetadataItem>, metadata: Array<PaymentGatewayRecipientFragment_App_metadata_MetadataItem> };

export type TaxedMoneyFragment = { net: OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_net_Money, gross: OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_gross_Money, tax: OrderOrCheckoutLineFragment_Checkout_shippingPrice_TaxedMoney_tax_Money };

export type TransactionItemFragment = { id: string, pspReference: string };

export type TransactionProcessActionFragment = { amount: number, currency: string, actionType: Types.TransactionFlowStrategyEnum };

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
export const OrderOrCheckoutLineFragment = new TypedDocumentString(`
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
    fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
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
}`, {"fragmentName":"OrderOrCheckoutLineFragment"}) as unknown as TypedDocumentString<OrderOrCheckoutLineFragment, unknown>;
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
export const TransactionItemFragment = new TypedDocumentString(`
    fragment TransactionItemFragment on TransactionItem {
  id
  pspReference
}
    `, {"fragmentName":"TransactionItemFragment"}) as unknown as TypedDocumentString<TransactionItemFragment, unknown>;
export const TransactionProcessActionFragment = new TypedDocumentString(`
    fragment TransactionProcessActionFragment on TransactionProcessAction {
  amount
  currency
  actionType
}
    `, {"fragmentName":"TransactionProcessActionFragment"}) as unknown as TypedDocumentString<TransactionProcessActionFragment, unknown>;