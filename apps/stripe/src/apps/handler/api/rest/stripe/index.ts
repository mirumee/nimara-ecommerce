import { Hono } from "hono";

import { all } from "@nimara/foundation/lib/array";
import {
  responseError,
  responseFromErrors,
  responseSuccess,
} from "@nimara/lib/hono/api/util";

import { container } from "@/container";
import { StripeMetaKey } from "@/domain/consts";
import { getAmountFromCents } from "@/domain/currency";
import {
  getIntentDashboardUrl,
  isAppEvent,
  mapStripeEventToSaleorEvent,
} from "@/domain/event-mapping";

const skipped = () => responseSuccess({ description: "Skipped." });

export const stripeRoutes = new Hono().post(
  "/webhooks/:saleorDomain",
  async (context) => {
    const config = container.get("config");
    const logger = context.get("logger");
    const body = await context.req.text();
    const tenant = context.req.param("saleorDomain");
    const signature = context.req.header("stripe-signature") ?? null;

    // Parsed only to route the event — untrusted until `verifyWebhook` passes.
    const unverified = JSON.parse(body) as {
      data: { object: { metadata?: Record<string, string> } };
      id: string;
    };
    const metadata = unverified.data.object.metadata ?? {};
    const {
      [StripeMetaKey.SALEOR_DOMAIN]: saleorDomain,
      [StripeMetaKey.CHANNEL_SLUG]: channelSlug,
      [StripeMetaKey.TRANSACTION_ID]: transactionId,
    } = metadata;

    // Not issued by this app (e.g. dashboard activity) — ack so Stripe stops.
    if (!all([transactionId, saleorDomain, channelSlug])) {
      logger.info("Received Stripe webhook without app metadata, skipping.", {
        id: unverified.id,
      });

      return skipped();
    }

    if (saleorDomain !== tenant) {
      logger.info(
        "Received Stripe webhook for another installation, skipping.",
        {
          eventSaleorDomain: saleorDomain,
          id: unverified.id,
          tenant,
        },
      );

      return skipped();
    }

    const installation = await container
      .get("appConfigService")
      .getBySaleorDomain({ saleorDomain: tenant });

    if (!installation.ok) {
      return responseFromErrors(installation.errors);
    }

    const gatewayResult = await container.get("paymentService")({
      saleorDomain: tenant,
      channelSlug,
    });

    if (!gatewayResult.ok) {
      return responseFromErrors(gatewayResult.errors);
    }

    const { config: gatewayConfig, gateway } = gatewayResult.data;

    if (!gatewayConfig.webhookSecretKey) {
      logger.error("Stripe webhook secret is not configured for the channel.", {
        channelSlug,
        saleorDomain: tenant,
      });

      return responseError({
        description: "Stripe webhook secret is not configured for the channel.",
        errors: [{ message: "webhookSecretKey is missing in the app config" }],
        status: 500,
      });
    }

    // Everything below runs on the verified event.
    const verified = await gateway.verifyWebhook({
      body,
      signature,
      secret: gatewayConfig.webhookSecretKey,
    });

    if (!verified.ok) {
      return responseFromErrors(verified.errors);
    }

    const notification = verified.data;

    logger.info("Received Stripe webhook.", {
      id: notification.id,
      stripeObjectId: notification.objectId,
      type: notification.type,
    });

    if (
      !isAppEvent({
        appId: config.APP_ID,
        environment: config.ENVIRONMENT,
        metadata: notification.metadata,
      })
    ) {
      logger.info("Received Stripe webhook from unknown source.", {
        id: notification.id,
        metadata: notification.metadata,
      });

      return skipped();
    }

    const eventData = mapStripeEventToSaleorEvent(notification);

    if (!eventData) {
      logger.info("Unsupported Stripe event type, skipping.", {
        id: notification.id,
        type: notification.type,
      });

      return skipped();
    }

    const saleorClient = container.get("saleorClient")({
      authToken: installation.data?.authToken,
      saleorDomain: tenant,
    });

    const reportResult = await saleorClient.transactionReport({
      transactionId,
      paymentMethodDetails: notification.paymentMethodDetails,
      // @ts-expect-error: decimal must be a string
      amount: getAmountFromCents({
        currency: notification.currency,
        amount: notification.amount,
      }),
      message: notification.lastErrorCode,
      externalUrl: getIntentDashboardUrl({
        paymentId: notification.objectId,
        secretKey: gatewayConfig.secretKey,
      }),
      pspReference: notification.objectId,
      time: new Date().toISOString(),
      ...eventData,
    });

    // Answering non-2xx is what makes Stripe redeliver the event.
    if (!reportResult.ok) {
      logger.error("Failed to report the transaction event to Saleor.", {
        errors: reportResult.errors,
        saleorDomain: tenant,
        transactionId,
      });

      return responseFromErrors(reportResult.errors);
    }

    // Saleor answers 200 with its own errors — the report still did not land.
    const reportErrors = reportResult.data?.errors ?? [];

    if (reportErrors.length) {
      logger.error("Saleor refused the transaction event report.", {
        errors: reportErrors,
        saleorDomain: tenant,
        transactionId,
      });

      return responseError({
        description: "Saleor refused the transaction event report.",
        errors: reportErrors.map(({ code, message }) => ({
          code,
          message: message ?? code,
        })),
        status: 502,
      });
    }

    return responseSuccess({ description: "Processed." });
  },
);
