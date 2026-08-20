import { Hono } from "hono";

import { container } from "@/container";
import { saleorWebhookValidationMiddleware } from "@/lib/middleware/saleor-webhook-validation-middleware";

import {
  paymentMethodInitializeTokenizationSessionHandler,
  paymentMethodProcessTokenizationSessionHandler,
  storedPaymentMethodDeleteRequestedHandler,
  storedPaymentMethodListHandler,
} from "./payment-methods";
import {
  paymentGatewayInitializeSessionHandler,
  transactionCancelationRequestedHandler,
  transactionChargeRequestedHandler,
  transactionInitializeSessionHandler,
  transactionProcessSessionHandler,
  transactionRefundRequestedHandler,
} from "./transactions";

export const webhooks = new Hono()
  .use(
    "*",
    ...saleorWebhookValidationMiddleware({
      allowedDomains: container.get("config").ALLOWED_DOMAINS,
      joseAuthService: container.get("joseAuthService"),
      getInstallation: (saleorDomain) =>
        container.get("appConfigService").getBySaleorDomain({ saleorDomain }),
    }),
  )
  .post(
    "/payment/gateway-initialize-session",
    paymentGatewayInitializeSessionHandler,
  )
  .post(
    "/payment/transaction-initialize-session",
    transactionInitializeSessionHandler,
  )
  .post(
    "/payment/transaction-process-session",
    transactionProcessSessionHandler,
  )
  .post(
    "/payment/transaction-charge-requested",
    transactionChargeRequestedHandler,
  )
  .post(
    "/payment/transaction-cancelation-requested",
    transactionCancelationRequestedHandler,
  )
  .post(
    "/payment/transaction-refund-requested",
    transactionRefundRequestedHandler,
  )
  .post("/payment/stored-payment-method-list", storedPaymentMethodListHandler)
  .post(
    "/payment/stored-payment-method-delete-requested",
    storedPaymentMethodDeleteRequestedHandler,
  )
  .post(
    "/payment/payment-method-initialize-tokenization-session",
    paymentMethodInitializeTokenizationSessionHandler,
  )
  .post(
    "/payment/payment-method-process-tokenization-session",
    paymentMethodProcessTokenizationSessionHandler,
  );
