export type CreditCard = {
  brand: string;
  expMonth: string;
  expYear: string;
  last4: string;
};

export type Paypal = { email: string };

export type PaymentMethodType = "card" | "paypal";

type PaymentMethodBase<PaymentMethod, Type> = {
  id: string;
  isDefault: boolean;
  paymentMethod: PaymentMethod;
  type: Type;
};

export type CardPaymentMethod = PaymentMethodBase<CreditCard, "card">;
export type PaypalPaymentMethod = PaymentMethodBase<Paypal, "paypal">;

export type PaymentMethod = CardPaymentMethod | PaypalPaymentMethod;
