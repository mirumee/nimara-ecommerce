export type CreditCard = {
  brand: string;
  expMonth: string;
  expYear: string;
  last4: string;
};

export type Paypal = { email: string };

/**
 * `other` carries anything with no dedicated presentation, so a customer can
 * still see and remove it.
 */
export type PaymentMethodType = "card" | "other" | "paypal";

type PaymentMethodBase<PaymentMethod, Type> = {
  id: string;
  isDefault: boolean;
  name: string;
  paymentMethod: PaymentMethod;
  token: string;
  type: Type;
};

export type CardPaymentMethod = PaymentMethodBase<CreditCard, "card">;
export type PaypalPaymentMethod = PaymentMethodBase<Paypal, "paypal">;

export type OtherPaymentMethod = PaymentMethodBase<null, "other"> & {
  providerType: string;
};

export type PaymentMethod =
  CardPaymentMethod | OtherPaymentMethod | PaypalPaymentMethod;
