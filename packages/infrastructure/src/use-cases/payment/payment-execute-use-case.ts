import type {
  PaymentExecuteInfra,
  PaymentExecuteUseCase,
} from "#root/public/stripe/payment/types";

export const paymentExecuteUseCase =
  ({
    paymentExecute,
  }: {
    paymentExecute: PaymentExecuteInfra;
  }): PaymentExecuteUseCase =>
  async (opts) =>
    paymentExecute(opts);
