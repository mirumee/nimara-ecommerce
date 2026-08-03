import { type CapabilityServices } from "@nimara/infrastructure/types";

export type PaymentService = CapabilityServices["getPaymentService"];

type PaymentExecuteOpts = Parameters<PaymentService["paymentExecute"]>[0];

export type PaymentGateway = PaymentExecuteOpts["initializeData"];

export type PaymentElementHandle = NonNullable<
  PaymentExecuteOpts["paymentElement"]
>;

export type PaymentSessionData = PaymentExecuteOpts["transactionData"];

export type MethodSessionData = Parameters<
  PaymentService["methodExecute"]
>[0]["methodSession"];

export type PaymentGatewayConfig = Parameters<
  PaymentService["gatewayInitialize"]
>[0]["gatewayConfig"];
