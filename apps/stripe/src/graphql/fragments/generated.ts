import type * as Types from "@nimara/codegen/schema";

import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export type ChannelFragment = {
  id: string;
  slug: string;
  name: string;
  currencyCode: string;
};

export type CheckoutSourceObjectFragment_Checkout_channel_Channel = {
  id: string;
  slug: string;
  name: string;
  currencyCode: string;
};

export type CheckoutSourceObjectFragment_Checkout_total_TaxedMoney_gross_Money =
  { currency: string; amount: number };

export type CheckoutSourceObjectFragment_Checkout_total_TaxedMoney = {
  gross: CheckoutSourceObjectFragment_Checkout_total_TaxedMoney_gross_Money;
};

export type CheckoutSourceObjectFragment = {
  id: string;
  languageCode: Types.LanguageCodeEnum;
  userEmail: string | null;
  channel: CheckoutSourceObjectFragment_Checkout_channel_Channel;
  total: CheckoutSourceObjectFragment_Checkout_total_TaxedMoney;
};

export type OrderSourceObjectFragment_Order_channel_Channel = {
  id: string;
  slug: string;
  name: string;
  currencyCode: string;
};

export type OrderSourceObjectFragment_Order_total_TaxedMoney_gross_Money = {
  currency: string;
  amount: number;
};

export type OrderSourceObjectFragment_Order_total_TaxedMoney = {
  gross: OrderSourceObjectFragment_Order_total_TaxedMoney_gross_Money;
};

export type OrderSourceObjectFragment = {
  id: string;
  languageCodeEnum: Types.LanguageCodeEnum;
  userEmail: string | null;
  channel: OrderSourceObjectFragment_Order_channel_Channel;
  total: OrderSourceObjectFragment_Order_total_TaxedMoney;
};

export type OrderOrCheckoutSourceObjectFragment_Checkout = {
  id: string;
  languageCode: Types.LanguageCodeEnum;
  userEmail: string | null;
  channel: CheckoutSourceObjectFragment_Checkout_channel_Channel;
  total: CheckoutSourceObjectFragment_Checkout_total_TaxedMoney;
};

export type OrderOrCheckoutSourceObjectFragment_Order = {
  id: string;
  languageCodeEnum: Types.LanguageCodeEnum;
  userEmail: string | null;
  channel: OrderSourceObjectFragment_Order_channel_Channel;
  total: OrderSourceObjectFragment_Order_total_TaxedMoney;
};

export type OrderOrCheckoutSourceObjectFragment =
  | OrderOrCheckoutSourceObjectFragment_Checkout
  | OrderOrCheckoutSourceObjectFragment_Order;

export type PaymentGatewayRecipientFragment_App_privateMetadata_MetadataItem = {
  key: string;
  value: string;
};

export type PaymentGatewayRecipientFragment_App_metadata_MetadataItem = {
  key: string;
  value: string;
};

export type PaymentGatewayRecipientFragment = {
  id: string;
  privateMetadata: Array<PaymentGatewayRecipientFragment_App_privateMetadata_MetadataItem>;
  metadata: Array<PaymentGatewayRecipientFragment_App_metadata_MetadataItem>;
};

export type TaxedMoneyFragment_TaxedMoney_net_Money = {
  currency: string;
  amount: number;
};

export type TaxedMoneyFragment_TaxedMoney_gross_Money = {
  currency: string;
  amount: number;
};

export type TaxedMoneyFragment_TaxedMoney_tax_Money = {
  currency: string;
  amount: number;
};

export type TaxedMoneyFragment = {
  net: TaxedMoneyFragment_TaxedMoney_net_Money;
  gross: TaxedMoneyFragment_TaxedMoney_gross_Money;
  tax: TaxedMoneyFragment_TaxedMoney_tax_Money;
};

export type TransactionActionFragment = {
  actionType: Types.TransactionActionEnum;
  amount: number | null;
};

export type TransactionItemFragment = { id: string; pspReference: string };

export type TransactionProcessActionFragment = {
  amount: number;
  currency: string;
  actionType: Types.TransactionFlowStrategyEnum;
};

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<
    DocumentTypeDecoration<TResult, TVariables>["__apiType"]
  >;
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
export const OrderOrCheckoutSourceObjectFragment = new TypedDocumentString(
  `
    fragment OrderOrCheckoutSourceObjectFragment on OrderOrCheckout {
  ... on Checkout {
    ...CheckoutSourceObjectFragment
  }
  ... on Order {
    ...OrderSourceObjectFragment
  }
}
    fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}
fragment CheckoutSourceObjectFragment on Checkout {
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
fragment OrderSourceObjectFragment on Order {
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
fragment MoneyFragment on Money {
  currency
  amount
}`,
  { fragmentName: "OrderOrCheckoutSourceObjectFragment" },
) as unknown as TypedDocumentString<
  OrderOrCheckoutSourceObjectFragment,
  unknown
>;
export const PaymentGatewayRecipientFragment = new TypedDocumentString(
  `
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
    `,
  { fragmentName: "PaymentGatewayRecipientFragment" },
) as unknown as TypedDocumentString<PaymentGatewayRecipientFragment, unknown>;
export const TaxedMoneyFragment = new TypedDocumentString(
  `
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
}`,
  { fragmentName: "TaxedMoneyFragment" },
) as unknown as TypedDocumentString<TaxedMoneyFragment, unknown>;
export const TransactionActionFragment = new TypedDocumentString(
  `
    fragment TransactionActionFragment on TransactionAction {
  actionType
  amount
}
    `,
  { fragmentName: "TransactionActionFragment" },
) as unknown as TypedDocumentString<TransactionActionFragment, unknown>;
export const TransactionItemFragment = new TypedDocumentString(
  `
    fragment TransactionItemFragment on TransactionItem {
  id
  pspReference
}
    `,
  { fragmentName: "TransactionItemFragment" },
) as unknown as TypedDocumentString<TransactionItemFragment, unknown>;
export const TransactionProcessActionFragment = new TypedDocumentString(
  `
    fragment TransactionProcessActionFragment on TransactionProcessAction {
  amount
  currency
  actionType
}
    `,
  { fragmentName: "TransactionProcessActionFragment" },
) as unknown as TypedDocumentString<TransactionProcessActionFragment, unknown>;
