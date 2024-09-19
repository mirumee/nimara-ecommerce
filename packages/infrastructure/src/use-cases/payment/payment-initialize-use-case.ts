import type {
  ClientInitializeInfra,
  PaymentInitializeUseCase,
} from "#root/public/stripe/payment/types";

export const paymentInitializeUseCase =
  ({
    initializeClient,
  }: {
    initializeClient: ClientInitializeInfra;
  }): PaymentInitializeUseCase =>
  async () => {
    await initializeClient();
  };
