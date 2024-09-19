import type {
  PaymentSaveInitializeInfra,
  PaymentSaveInitializeUseCase,
} from "#root/public/stripe/payment/types";

export const paymentSaveInitializeUseCase =
  ({
    paymentMethodSaveInitialize,
  }: {
    paymentMethodSaveInitialize: PaymentSaveInitializeInfra;
  }): PaymentSaveInitializeUseCase =>
  async (opts) =>
    paymentMethodSaveInitialize(opts);
