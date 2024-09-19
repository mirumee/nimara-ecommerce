import type {
  CustomerPaymentMethodsListUseCase,
  PaymentMethodsListInfra,
} from "#root/public/stripe/payment/types";

export const customerPaymentMethodsListUseCase =
  ({
    paymentMethodsList,
  }: {
    paymentMethodsList: PaymentMethodsListInfra;
  }): CustomerPaymentMethodsListUseCase =>
  (opts) =>
    paymentMethodsList(opts);
