import { createPaymentElementUseCase } from "#root/use-cases/payment/create-payment-element-use-case";
import { customerGetUseCase } from "#root/use-cases/payment/customer-get-use-case";
import { customerPaymentMethodDeleteUseCase } from "#root/use-cases/payment/customer-payment-method-delete-use-case";
import { paymentExecuteUseCase } from "#root/use-cases/payment/payment-execute-use-case";
import { paymentGatewayInitializeUseCase } from "#root/use-cases/payment/payment-gateway-initialize-use-case";
import { paymentInitializeUseCase } from "#root/use-cases/payment/payment-initialize-use-case";
import { paymentMethodSaveExecuteUseCase } from "#root/use-cases/payment/payment-method-save-execute-use-case";
import { paymentMethodSaveProcessUseCase } from "#root/use-cases/payment/payment-method-save-process-use-case";
import { customerPaymentMethodsListUseCase } from "#root/use-cases/payment/payment-methods-list-use-case";
import { paymentResultProcessUseCase } from "#root/use-cases/payment/payment-result-process-use-case";
import { paymentSaveInitializeUseCase } from "#root/use-cases/payment/payment-save-initialize-use-case";

import { clientInitializeInfra } from "./infrastructure/client-initialize-infra";
import { customerFromGatewayGetInfra } from "./infrastructure/customer-from-gateway-get-infra";
import { customerFromSaleorGetInfra } from "./infrastructure/customer-from-saleor-get-infra";
import { customerInGatewayCreateInfra } from "./infrastructure/customer-in-gateway-create-infra";
import { customerInSaleorSave } from "./infrastructure/customer-in-saleor-save";
import { customerPaymentMethodValidateInfra } from "./infrastructure/customer-payment-method-validate-infra";
import { paymentElementCreateInfra } from "./infrastructure/payment-element-create-infra";
import { paymentExecuteInfra } from "./infrastructure/payment-execute-infra";
import { paymentGatewayInitializeInfra } from "./infrastructure/payment-gateway-initialize-infra";
import { paymentMethodDetachInfra } from "./infrastructure/payment-method-detach-infra";
import { paymentMethodSaveExecuteInfra } from "./infrastructure/payment-method-save-execute-infra";
import { paymentSaveInitializeInfra } from "./infrastructure/payment-method-save-initialize-infra";
import { paymentMethodSaveProcessInfra } from "./infrastructure/payment-method-save-process-infra";
import { paymentMethodSetDefaultInfra } from "./infrastructure/payment-method-set-default";
import { paymentMethodsListInfra } from "./infrastructure/payment-methods-list-infra";
import { paymentResultProcessInfra } from "./infrastructure/payment-result-process-infra";
import { transactionInitializeInfra } from "./infrastructure/transaction-initialize-infra";
import { transactionProcessInfra } from "./infrastructure/transaction-process-infra";
import { type PaymentServiceConfig } from "./types";

/**
 * To use different Stripe account per channel, provide different keys for each channel.
 */
export const stripePaymentService = (config: PaymentServiceConfig) => {
  const state = {};

  return {
    paymentGatewayInitialize: paymentGatewayInitializeUseCase({
      paymentGatewayInitialize: paymentGatewayInitializeInfra(config),
    }),
    paymentGatewayTransactionInitialize: transactionInitializeInfra(
      config,
      state,
    ),
    paymentInitialize: paymentInitializeUseCase({
      initializeClient: clientInitializeInfra(config, state),
    }),
    paymentElementCreate: createPaymentElementUseCase({
      paymentElementCreate: paymentElementCreateInfra(state),
    }),
    paymentExecute: paymentExecuteUseCase({
      paymentExecute: paymentExecuteInfra(state),
    }),
    paymentResultProcess: paymentResultProcessUseCase({
      paymentResultProcess: paymentResultProcessInfra,
      transactionProcess: transactionProcessInfra(config),
    }),
    paymentMethodSaveInitialize: paymentSaveInitializeUseCase({
      paymentMethodSaveInitialize: paymentSaveInitializeInfra(config),
    }),
    paymentMethodSaveExecute: paymentMethodSaveExecuteUseCase({
      paymentMethodSaveExecute: paymentMethodSaveExecuteInfra(state),
    }),
    paymentMethodSaveProcess: paymentMethodSaveProcessUseCase({
      paymentMethodSaveProcess: paymentMethodSaveProcessInfra(config),
      paymentMethodSetDefault: paymentMethodSetDefaultInfra(config),
    }),
    customerGet: customerGetUseCase({
      customerFromGatewayGetInfra: customerFromGatewayGetInfra(config),
      customerInGatewayCreateInfra: customerInGatewayCreateInfra(config),
      customerInSaleorSave: customerInSaleorSave(config),
      customerFromSaleorGetInfra: customerFromSaleorGetInfra,
    }),
    customerPaymentMethodsList: customerPaymentMethodsListUseCase({
      paymentMethodsList: paymentMethodsListInfra(config),
    }),
    customerPaymentMethodDelete: customerPaymentMethodDeleteUseCase({
      paymentMethodDetach: paymentMethodDetachInfra(config),
      customerPaymentMethodValidate: customerPaymentMethodValidateInfra(config),
    }),
  };
};
