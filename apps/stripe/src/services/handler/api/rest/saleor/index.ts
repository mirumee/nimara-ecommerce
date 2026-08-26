import { saleorWebhookValidationMiddleware } from "@nimara/lib/hono/middleware/saleor-webhook-validation";
import { createSaleorRoutes } from "@nimara/lib/hono/saleor/routes";
import { type HandlerContext } from "@nimara/lib/hono/saleor/types";
import { type SaleorWebhook } from "@nimara/lib/saleor/webhooks";

import { container } from "@/container";
import {
  ListStoredPaymentMethodsSubscriptionDocument,
  PaymentGatewayInitializeSessionSubscriptionDocument,
  PaymentMethodInitializeTokenizationSessionSubscriptionDocument,
  PaymentMethodProcessTokenizationSessionSubscriptionDocument,
  StoredPaymentMethodDeleteRequestedSubscriptionDocument,
  TransactionCancelationRequestedSubscriptionDocument,
  TransactionChargeRequestedSubscriptionDocument,
  TransactionInitializeSessionSubscriptionDocument,
  TransactionProcessSessionSubscriptionDocument,
  TransactionRefundRequestedSubscriptionDocument,
} from "@/graphql/generated/client";

import {
  paymentMethodInitializeTokenizationSessionHandler,
  paymentMethodProcessTokenizationSessionHandler,
  storedPaymentMethodDeleteRequestedHandler,
  storedPaymentMethodListHandler,
} from "./webhooks/payment-methods";
import {
  paymentGatewayInitializeSessionHandler,
  transactionCancelationRequestedHandler,
  transactionChargeRequestedHandler,
  transactionInitializeSessionHandler,
  transactionProcessSessionHandler,
  transactionRefundRequestedHandler,
} from "./webhooks/transactions";

const CONFIG = container.get("config");

const webhooks: SaleorWebhook<HandlerContext<any>>[] = [
  {
    handler: paymentGatewayInitializeSessionHandler,
    name: "PaymentGatewayInitializeSession",
    path: "/payment/gateway-initialize-session",
    query: PaymentGatewayInitializeSessionSubscriptionDocument,
    syncEvents: ["PAYMENT_GATEWAY_INITIALIZE_SESSION"],
  },
  {
    handler: transactionInitializeSessionHandler,
    name: "TransactionInitializeSession",
    path: "/payment/transaction-initialize-session",
    query: TransactionInitializeSessionSubscriptionDocument,
    syncEvents: ["TRANSACTION_INITIALIZE_SESSION"],
  },
  {
    handler: transactionProcessSessionHandler,
    name: "TransactionProcessSession",
    path: "/payment/transaction-process-session",
    query: TransactionProcessSessionSubscriptionDocument,
    syncEvents: ["TRANSACTION_PROCESS_SESSION"],
  },
  {
    handler: transactionChargeRequestedHandler,
    name: "TransactionChargeRequested",
    path: "/payment/transaction-charge-requested",
    query: TransactionChargeRequestedSubscriptionDocument,
    syncEvents: ["TRANSACTION_CHARGE_REQUESTED"],
  },
  {
    handler: transactionCancelationRequestedHandler,
    name: "TransactionCancelationRequested",
    path: "/payment/transaction-cancelation-requested",
    query: TransactionCancelationRequestedSubscriptionDocument,
    syncEvents: ["TRANSACTION_CANCELATION_REQUESTED"],
  },
  {
    handler: transactionRefundRequestedHandler,
    name: "TransactionRefundRequested",
    path: "/payment/transaction-refund-requested",
    query: TransactionRefundRequestedSubscriptionDocument,
    syncEvents: ["TRANSACTION_REFUND_REQUESTED"],
  },
  {
    handler: storedPaymentMethodListHandler,
    name: "ListStoredPaymentMethods",
    path: "/payment/stored-payment-method-list",
    query: ListStoredPaymentMethodsSubscriptionDocument,
    syncEvents: ["LIST_STORED_PAYMENT_METHODS"],
  },
  {
    handler: storedPaymentMethodDeleteRequestedHandler,
    name: "StoredPaymentMethodDeleteRequested",
    path: "/payment/stored-payment-method-delete-requested",
    query: StoredPaymentMethodDeleteRequestedSubscriptionDocument,
    syncEvents: ["STORED_PAYMENT_METHOD_DELETE_REQUESTED"],
  },
  {
    handler: paymentMethodInitializeTokenizationSessionHandler,
    name: "PaymentMethodInitializeTokenizationSession",
    path: "/payment/payment-method-initialize-tokenization-session",
    query: PaymentMethodInitializeTokenizationSessionSubscriptionDocument,
    syncEvents: ["PAYMENT_METHOD_INITIALIZE_TOKENIZATION_SESSION"],
  },
  {
    handler: paymentMethodProcessTokenizationSessionHandler,
    name: "PaymentMethodProcessTokenizationSession",
    path: "/payment/payment-method-process-tokenization-session",
    query: PaymentMethodProcessTokenizationSessionSubscriptionDocument,
    syncEvents: ["PAYMENT_METHOD_PROCESS_TOKENIZATION_SESSION"],
  },
];

export const saleorRoutes = createSaleorRoutes({
  allowedDomains: CONFIG.ALLOWED_DOMAINS,
  installApp: container.get("installApp"),
  manifest: {
    appPath: "/app",
    id: CONFIG.APP_ID,
    name: CONFIG.DISPLAY_NAME,
    permissions: ["HANDLE_PAYMENTS", "MANAGE_USERS"],
    version: CONFIG.VERSION,
  },
  webhookMiddlewares: saleorWebhookValidationMiddleware({
    getInstallation: (saleorDomain) =>
      container.get("appConfigService").getBySaleorDomain({ saleorDomain }),
    joseAuthService: container.get("joseAuthService"),
  }),
  webhooks,
});
