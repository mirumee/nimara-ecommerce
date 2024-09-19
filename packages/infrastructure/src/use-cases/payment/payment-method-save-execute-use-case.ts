import type {
  PaymentMethodSaveExecuteInfra,
  PaymentMethodSaveExecuteUseCase,
} from "#root/public/stripe/payment/types";

export const paymentMethodSaveExecuteUseCase =
  ({
    paymentMethodSaveExecute,
  }: {
    paymentMethodSaveExecute: PaymentMethodSaveExecuteInfra;
  }): PaymentMethodSaveExecuteUseCase =>
  (opts) =>
    paymentMethodSaveExecute(opts);
