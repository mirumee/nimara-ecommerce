import { responseError, responseSuccess } from "@/lib/api/util";
import { getAmountFromCents } from "@/lib/currency";
import { all } from "@/lib/misc";
import { getStripeApi, stripeRouteErrorsHandler } from "@/lib/stripe/api";
import {
  StripeMetaKey,
  type SupportedStripeWebhookEvent,
} from "@/lib/stripe/const";
import {
  getIntentDashboardUrl,
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
    const [body, event, { channel }] = await Promise.all([
      request.clone().text(),
      request.json() as Promise<SupportedStripeWebhookEvent>,
      params,
    ]);
    const stripeObject = event.data.object;
    const {
      [StripeMetaKey.SALEOR_DOMAIN]: saleorDomain,
      [StripeMetaKey.CHANNEL_SLUG]: channelSlug,
      [StripeMetaKey.TRANSACTION_ID]: transactionId,
    } = stripeObject.metadata ?? {};

    logger.info("Received Stripe webhook.", {
      id: event.id,
      stripeObjectId: stripeObject.id,
      type: event.type,
    });

    /**
     * Metadata missing.
     */
    if (!all([transactionId, saleorDomain, channelSlug])) {
      logger.error("Stripe webhook missing one of required metadata.", {
        id: event.id,
        metadata: stripeObject.metadata,
      });

      const errors = Object.entries({
        transactionId,
        saleorDomain,
        channelSlug,
      })
        .filter(([_, value]) => !value)
        .map(([key]) => ({ message: `${key} is required` }));

      return responseError({
        description: "Missing required metadata in Stripe event.",
        errors,
        status: 422,
      });
    }

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

    const configProvider = getConfigProvider({ saleorDomain });
    const config = await configProvider.getBySaleorDomain({ saleorDomain });
    const gatewayConfig =
      await configProvider.getPaymentGatewayConfigForChannel({
        saleorDomain,
        channelSlug,
      });
    const saleorClient = getSaleorClient({
      authToken: config?.authToken,
      saleorDomain,
      logger,
    });
    const api = getStripeApi(gatewayConfig.secretKey);

    /**
     * Webhook verification.
     */
    api.webhooks.constructEvent(
      // @ts-expect-error https://nodejs.org/api/buffer.html#buftostringencoding-start-end
      body.toString("utf-8"),
      request.headers.get("stripe-signature") ?? "",
      gatewayConfig.webhookSecretKey ?? "",
    );

    /**
     * Saleor transaction report.
     */
    const eventData = mapStripeEventToSaleorEvent(event);

    await saleorClient.transactionReport({
      transactionId,
      // @ts-expect-error: decimal must be a string
      amount: getAmountFromCents({
        currency: stripeObject.currency,
        amount: stripeObject.amount,
      }),
      // @ts-expect-error Charge won't have last_payment_error.
      message: stripeObject?.last_payment_error?.code ?? null,
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
