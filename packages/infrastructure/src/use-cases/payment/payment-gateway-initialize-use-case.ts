import type {
  PaymentGatewayInitializeInfra,
  PaymentGatewayInitializeUseCase,
} from "#root/public/stripe/payment/types";

export const paymentGatewayInitializeUseCase =
  ({
    paymentGatewayInitialize,
  }: {
    paymentGatewayInitialize: PaymentGatewayInitializeInfra;
  }): PaymentGatewayInitializeUseCase =>
  (opts) =>
    paymentGatewayInitialize(opts);
