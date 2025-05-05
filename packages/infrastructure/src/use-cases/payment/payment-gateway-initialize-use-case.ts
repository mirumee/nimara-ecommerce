import type {
  PaymentGatewayInitializeInfra,
  PaymentGatewayInitializeUseCase,
} from "../../payment/types.ts";

export const paymentGatewayInitializeUseCase =
  ({
    paymentGatewayInitialize,
  }: {
    paymentGatewayInitialize: PaymentGatewayInitializeInfra;
  }): PaymentGatewayInitializeUseCase =>
  (opts) =>
    paymentGatewayInitialize(opts);
