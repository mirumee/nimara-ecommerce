import { paymentMethodDeleteInfra } from "./saleor/infrastructure/payment-method-delete-infra";
import { paymentMethodListInfra } from "./saleor/infrastructure/payment-method-list-infra";
import { paymentExecuteInfra } from "./stripe/infrastructure/payment-execute-infra";
import { paymentInitializeGatewayInfra } from "./stripe/infrastructure/payment-initialize-gateway-infra";
import { paymentInitializeTransactionInfra } from "./stripe/infrastructure/payment-initialize-transaction-infra";
import { paymentMethodExecuteInfra } from "./stripe/infrastructure/payment-method-execute-infra";
import { paymentMethodInitializeInfra } from "./stripe/infrastructure/payment-method-initialize-infra";
import { paymentMethodProcessInfra } from "./stripe/infrastructure/payment-method-process-infra";
import { paymentProcessInfra } from "./stripe/infrastructure/payment-process-infra";
import { type StripePaymentService } from "./stripe/types";
import { type PaymentServiceConfig } from "./types";

/**
 * Gateway secrets stay with the payment app, so this service holds no keys and
 * is safe to load in the browser.
 */
export const stripePaymentService = (
  config: PaymentServiceConfig,
): StripePaymentService => ({
  gatewayInitialize: paymentInitializeGatewayInfra(config),
  methodDelete: paymentMethodDeleteInfra(config),
  methodExecute: paymentMethodExecuteInfra(config),
  methodInitialize: paymentMethodInitializeInfra(config),
  methodList: paymentMethodListInfra(config),
  methodProcess: paymentMethodProcessInfra(config),
  paymentExecute: paymentExecuteInfra(config),
  paymentInitialize: paymentInitializeTransactionInfra(config),
  paymentProcess: paymentProcessInfra(config),
});
