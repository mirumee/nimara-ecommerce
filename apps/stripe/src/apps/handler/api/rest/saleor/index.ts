import { Hono } from "hono";
import { z } from "zod";

import { type SaleorAppManifest } from "@nimara/domain/objects/SaleorApp";
import { saleorHeaders } from "@nimara/infrastructure/apps/saleor/schemas";
import { isDomainAllowed } from "@nimara/infrastructure/apps/saleor/validation";

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
import { getAppBaseUrl, responseFromErrors } from "@/lib/api/util";
import { UnauthorizedDomainError } from "@/lib/error/http";
import { zodValidatorMiddleware } from "@/lib/middleware/zod-validator-middleware";
import { saleorUrlFromDomain } from "@/lib/saleor/url";

import { webhooks } from "./webhooks";

export const saleorRoutes = new Hono()
  .get("/manifest", (context) => {
    const config = container.get("config");
    const appBaseUrl = getAppBaseUrl(context.req);

    const manifest: SaleorAppManifest = {
      id: config.APP_ID,
      version: config.VERSION,
      name: config.APP_ID,
      permissions: ["HANDLE_PAYMENTS", "MANAGE_USERS"],
      tokenTargetUrl: `${appBaseUrl}/api/saleor/register`,
      appUrl: `${appBaseUrl}/app`,
      webhooks: [
        {
          query: PaymentGatewayInitializeSessionSubscriptionDocument.toString(),
          name: "PaymentGatewayInitializeSession",
          targetUrl: `${appBaseUrl}/api/saleor/webhooks/payment/gateway-initialize-session`,
          syncEvents: ["PAYMENT_GATEWAY_INITIALIZE_SESSION"],
          asyncEvents: [],
        },
        {
          query: TransactionInitializeSessionSubscriptionDocument.toString(),
          name: "TransactionInitializeSession",
          targetUrl: `${appBaseUrl}/api/saleor/webhooks/payment/transaction-initialize-session`,
          syncEvents: ["TRANSACTION_INITIALIZE_SESSION"],
          asyncEvents: [],
        },
        {
          query: TransactionProcessSessionSubscriptionDocument.toString(),
          name: "TransactionProcessSession",
          targetUrl: `${appBaseUrl}/api/saleor/webhooks/payment/transaction-process-session`,
          syncEvents: ["TRANSACTION_PROCESS_SESSION"],
          asyncEvents: [],
        },
        {
          query: TransactionChargeRequestedSubscriptionDocument.toString(),
          name: "TransactionChargeRequested",
          targetUrl: `${appBaseUrl}/api/saleor/webhooks/payment/transaction-charge-requested`,
          syncEvents: ["TRANSACTION_CHARGE_REQUESTED"],
          asyncEvents: [],
        },
        {
          query: TransactionCancelationRequestedSubscriptionDocument.toString(),
          name: "TransactionCancelationRequested",
          targetUrl: `${appBaseUrl}/api/saleor/webhooks/payment/transaction-cancelation-requested`,
          syncEvents: ["TRANSACTION_CANCELATION_REQUESTED"],
          asyncEvents: [],
        },
        {
          query: TransactionRefundRequestedSubscriptionDocument.toString(),
          name: "TransactionRefundRequested",
          targetUrl: `${appBaseUrl}/api/saleor/webhooks/payment/transaction-refund-requested`,
          syncEvents: ["TRANSACTION_REFUND_REQUESTED"],
          asyncEvents: [],
        },
        {
          query: ListStoredPaymentMethodsSubscriptionDocument.toString(),
          name: "ListStoredPaymentMethods",
          targetUrl: `${appBaseUrl}/api/saleor/webhooks/payment/stored-payment-method-list`,
          syncEvents: ["LIST_STORED_PAYMENT_METHODS"],
          asyncEvents: [],
        },
        {
          query:
            StoredPaymentMethodDeleteRequestedSubscriptionDocument.toString(),
          name: "StoredPaymentMethodDeleteRequested",
          targetUrl: `${appBaseUrl}/api/saleor/webhooks/payment/stored-payment-method-delete-requested`,
          syncEvents: ["STORED_PAYMENT_METHOD_DELETE_REQUESTED"],
          asyncEvents: [],
        },
        {
          query:
            PaymentMethodInitializeTokenizationSessionSubscriptionDocument.toString(),
          name: "PaymentMethodInitializeTokenizationSession",
          targetUrl: `${appBaseUrl}/api/saleor/webhooks/payment/payment-method-initialize-tokenization-session`,
          syncEvents: ["PAYMENT_METHOD_INITIALIZE_TOKENIZATION_SESSION"],
          asyncEvents: [],
        },
        {
          query:
            PaymentMethodProcessTokenizationSessionSubscriptionDocument.toString(),
          name: "PaymentMethodProcessTokenizationSession",
          targetUrl: `${appBaseUrl}/api/saleor/webhooks/payment/payment-method-process-tokenization-session`,
          syncEvents: ["PAYMENT_METHOD_PROCESS_TOKENIZATION_SESSION"],
          asyncEvents: [],
        },
      ],
    };

    return context.json(manifest);
  })
  .post(
    "/register",
    zodValidatorMiddleware("header", saleorHeaders),
    zodValidatorMiddleware("json", z.object({ auth_token: z.string() })),
    async (context) => {
      const config = container.get("config");
      const logger = context.get("logger");
      const header = context.req.valid("header");
      const json = context.req.valid("json");
      const saleorDomain = header["saleor-domain"];

      if (
        !isDomainAllowed({
          domain: saleorDomain,
          allowedDomains: config.ALLOWED_DOMAINS,
        })
      ) {
        logger.warning(`Rejected installation for ${saleorDomain}.`);

        throw new UnauthorizedDomainError({
          message: config.ALLOWED_DOMAINS.length
            ? `${saleorDomain} is not an allowed Saleor domain.`
            : "No Saleor domain is allowed. Set ALLOWED_DOMAINS to the domains this deployment serves.",
        });
      }

      logger.info(`Installing app for ${saleorDomain}.`);

      const result = await container.get("installApp")({
        authToken: json.auth_token,
        saleorDomain,
        saleorUrl: saleorUrlFromDomain(saleorDomain),
      });

      if (!result.ok) {
        logger.error(`Failed to install for ${saleorDomain}.`, {
          errors: result.errors,
        });

        return responseFromErrors(result.errors);
      }

      logger.info(`Installation successful for ${saleorDomain}.`);

      return context.json({ status: "ok" });
    },
  )
  .route("/webhooks", webhooks);
