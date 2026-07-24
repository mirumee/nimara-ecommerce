import { responseError, responseSuccess } from "@/lib/api/util";
import { getAmountFromCents } from "@/lib/currency";
import { all } from "@/lib/misc";
import { getStripeApi, stripeRouteErrorsHandler } from "@/lib/stripe/api";
import {
  StripeMetaKey,
  type SupportedStripeWebhookEvent,
} from "@/lib/stripe/const";
import {
  fetchPaymentMethodDetails,
  getIntentDashboardUrl,
  getPaymentIntentReportAmount,
  isAppEvent,
  mapStripeEventToSaleorEvent,
} from "@/lib/stripe/util";
import { getConfigProvider } from "@/providers/config";
import { getLoggingProvider } from "@/providers/logging";
import { getSaleorClient } from "@/providers/saleor";

export const POST = stripeRouteErrorsHandler(
  async (
    request: Request,
    { params }: { params: Promise<{ channel: string }> },
  ) => {
    const logger = getLoggingProvider();
    const [body, { channel }] = await Promise.all([
      request.clone().text(),
      params,
    ]);

    /**
     * The payload is parsed before verification only to resolve the tenant
     * (saleor domain) holding the webhook secret — nothing from it is
     * trusted until `constructEvent` validates the signature below.
     */
    const unverifiedEvent = JSON.parse(body) as SupportedStripeWebhookEvent;
    const {
      [StripeMetaKey.SALEOR_DOMAIN]: saleorDomain,
      [StripeMetaKey.CHANNEL_SLUG]: channelSlug,
      [StripeMetaKey.TRANSACTION_ID]: transactionId,
    } = unverifiedEvent.data?.object?.metadata ?? {};

    /**
     * Metadata missing — not an event issued by this app (e.g. manual
     * dashboard activity on the same account). Acknowledge it so Stripe
     * does not retry.
     */
    if (!all([transactionId, saleorDomain, channelSlug])) {
      logger.info("Received Stripe webhook without app metadata, skipping.", {
        id: unverifiedEvent.id,
      });

      return responseSuccess({ description: "Skipped." });
    }

    const configProvider = getConfigProvider({ saleorDomain });
    /**
     * The secret is resolved for the channel this endpoint serves (from the
     * URL), not the channel the unverified payload claims.
     */
    const gatewayConfig =
      await configProvider.getPaymentGatewayConfigForChannel({
        saleorDomain,
        channelSlug: channel,
      });

    if (!gatewayConfig.webhookSecretKey) {
      logger.error("Stripe webhook secret is not configured for the channel.", {
        channelSlug: channel,
        saleorDomain,
      });

      return responseError({
        description: "Stripe webhook secret is not configured for the channel.",
        errors: [{ message: "webhookSecretKey is missing in the app config" }],
        status: 500,
      });
    }

    const api = getStripeApi(gatewayConfig.secretKey);

    /**
     * Webhook verification — everything below runs on the verified event.
     */
    const event = api.webhooks.constructEvent(
      body,
      request.headers.get("stripe-signature") ?? "",
      gatewayConfig.webhookSecretKey,
    ) as SupportedStripeWebhookEvent;
    const stripeObject = event.data.object;

    logger.info("Received Stripe webhook.", {
      id: event.id,
      stripeObjectId: stripeObject.id,
      type: event.type,
    });

    /**
     * Metadata miss-match.
     */
    if (!isAppEvent(event)) {
      logger.info("Received Stripe webhook from unknown source.", {
        id: event.id,
        metadata: stripeObject.metadata,
      });

      return responseSuccess({ description: "Skipped." });
    }

    /**
     * When using same api key for different channels, Stripe will fire duplicated webhooks, each
     * for one channel causing errors - thus skip such events.
     */
    if (channel !== channelSlug) {
      logger.info("Received object from different channel, skipping.", {
        routeChannel: channel,
        stripeObjectChannel: channelSlug,
      });

      return responseSuccess({ description: "Skipped." });
    }

    const config = await configProvider.getBySaleorDomain({ saleorDomain });
    const saleorClient = getSaleorClient({
      authToken: config?.authToken,
      saleorDomain,
      logger,
    });

    /**
     * Saleor transaction report.
     */
    const eventData = mapStripeEventToSaleorEvent(event);

    if (!eventData) {
      logger.info("Unsupported Stripe event type, skipping.", {
        id: event.id,
        type: event.type,
      });

      return responseSuccess({ description: "Skipped." });
    }

    let paymentMethodDetails;

    if ("payment_method" in stripeObject) {
      paymentMethodDetails = await fetchPaymentMethodDetails(
        api,
        stripeObject.payment_method,
      );
    }

    const reportAmount =
      stripeObject.object === "payment_intent"
        ? getPaymentIntentReportAmount(stripeObject)
        : stripeObject.amount;

    await saleorClient.transactionReport({
      transactionId,
      paymentMethodDetails,
      amount: getAmountFromCents({
        currency: stripeObject.currency,
        amount: reportAmount,
      }),
      message:
        "last_payment_error" in stripeObject
          ? (stripeObject.last_payment_error?.code ?? null)
          : null,
      externalUrl: getIntentDashboardUrl({
        paymentId: event.data.object.id,
        secretKey: gatewayConfig.secretKey,
      }),
      pspReference: event.data.object.id,
      time: new Date().toISOString(),
      ...eventData,
    });

    return responseSuccess({ description: "Processed." });
  },
);
