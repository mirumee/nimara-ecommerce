import type {
  PaymentExecuteInfra,
  PaymentExecuteUseCase,
} from "../../payment/types.ts";

export const paymentExecuteUseCase =
  ({
    paymentExecute,
  }: {
    paymentExecute: PaymentExecuteInfra;
  }): PaymentExecuteUseCase =>
  async (opts) =>
    paymentExecute(opts);
