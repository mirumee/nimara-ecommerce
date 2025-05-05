import type {
  CustomerPaymentMethodsListUseCase,
  PaymentMethodsListInfra,
} from "../../payment/types.ts";

export const customerPaymentMethodsListUseCase =
  ({
    paymentMethodsList,
  }: {
    paymentMethodsList: PaymentMethodsListInfra;
  }): CustomerPaymentMethodsListUseCase =>
  (opts) =>
    paymentMethodsList(opts);
