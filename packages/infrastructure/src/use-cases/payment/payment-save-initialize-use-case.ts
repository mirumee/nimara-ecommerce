import type {
  PaymentSaveInitializeInfra,
  PaymentSaveInitializeUseCase,
} from "../../payment/types.ts";

export const paymentSaveInitializeUseCase =
  ({
    paymentMethodSaveInitialize,
  }: {
    paymentMethodSaveInitialize: PaymentSaveInitializeInfra;
  }): PaymentSaveInitializeUseCase =>
  async (opts) =>
    paymentMethodSaveInitialize(opts);
