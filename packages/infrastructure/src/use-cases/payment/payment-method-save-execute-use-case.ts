import type {
  PaymentMethodSaveExecuteInfra,
  PaymentMethodSaveExecuteUseCase,
} from "../../payment/types.ts";

export const paymentMethodSaveExecuteUseCase =
  ({
    paymentMethodSaveExecute,
  }: {
    paymentMethodSaveExecute: PaymentMethodSaveExecuteInfra;
  }): PaymentMethodSaveExecuteUseCase =>
  (opts) =>
    paymentMethodSaveExecute(opts);
