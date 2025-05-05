import type {
  ClientInitializeInfra,
  PaymentInitializeUseCase,
} from "../../payment/types.ts";

export const paymentInitializeUseCase =
  ({
    initializeClient,
  }: {
    initializeClient: ClientInitializeInfra;
  }): PaymentInitializeUseCase =>
  async () => {
    await initializeClient();
  };
