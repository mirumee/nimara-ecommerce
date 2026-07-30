import Stripe from "stripe";

import { type PaymentMethodProcessTokenizationSessionSubscription } from "@/graphql/subscriptions/generated";
import { isError } from "@/lib/error";
import { resolveAppConfigForChannel } from "@/lib/saleor/config/context";
import {
  parseTokenizationData,
  tokenizationResponse,
} from "@/lib/saleor/payment-method/util";
import { verifySaleorWebhookRoute } from "@/lib/saleor/webhooks/api";
import { getStripeApi, stripeRouteErrorsHandler } from "@/lib/stripe/api";
import { StripeMetaKey } from "@/lib/stripe/const";
import {
  getExpandableId,
  mapSetupIntentStatusToProcessResult,
} from "@/lib/stripe/payment-method";
import { getLoggingProvider } from "@/providers/logging";

export const POST = stripeRouteErrorsHandler(
  verifySaleorWebhookRoute<PaymentMethodProcessTokenizationSessionSubscription>(
    async ({ event, headers }) => {
      const logger = getLoggingProvider();

      const saleorDomain = headers["saleor-domain"];
      const channelSlug = event.channel.slug;
      const setupIntentId = event.id;
      const { config, response } = await resolveAppConfigForChannel({
        channelSlug,
        saleorDomain,
      });

      if (!config) {
        return response;
      }

      const { gatewayConfig } = config;
      const stripe = getStripeApi(gatewayConfig.secretKey);
      let setupIntent: Stripe.SetupIntent;

      try {
        setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
      } catch (err) {
        if (
          isError(err, Stripe.errors.StripeInvalidRequestError) &&
          err.code === "resource_missing"
        ) {
          logger.warning("Tokenization referenced an unknown setup intent.", {
            channelSlug,
            setupIntentId,
            userId: event.user.id,
          });

          return tokenizationResponse({
            error: "Tokenization session does not exist.",
            id: setupIntentId,
            result: "FAILED_TO_TOKENIZE",
          });
        }

        throw err;
      }

      /**
       * The session id is supplied by the storefront, so the intent is only
       * accepted when this app created it for this very user.
       */
      if (
        setupIntent.metadata?.[StripeMetaKey.SALEOR_USER_ID] !== event.user.id
      ) {
        logger.warning("Tokenization referenced a foreign setup intent.", {
          channelSlug,
          setupIntentId,
          userId: event.user.id,
        });

        return tokenizationResponse({
          error: "Tokenization session does not belong to this user.",
          id: setupIntentId,
          result: "FAILED_TO_TOKENIZE",
        });
      }

      const result = mapSetupIntentStatusToProcessResult(setupIntent.status);
      const paymentMethodId = getExpandableId(setupIntent.payment_method);

      if (result !== "SUCCESSFULLY_TOKENIZED" || !paymentMethodId) {
        logger.info("Tokenization has not completed.", {
          channelSlug,
          result,
          setupIntentId,
          status: setupIntent.status,
          userId: event.user.id,
        });

        return tokenizationResponse({
          error: setupIntent.last_setup_error?.message,
          /**
           * Repeating the session id lets the storefront call process again
           * once the shopper finishes the outstanding action.
           */
          id: setupIntentId,
          result:
            result === "SUCCESSFULLY_TOKENIZED" ? "FAILED_TO_TOKENIZE" : result,
        });
      }

      const customerId = getExpandableId(setupIntent.customer);

      if (customerId && parseTokenizationData(event.data).setAsDefault) {
        await stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: paymentMethodId },
        });
      }

      logger.info("Tokenized payment method.", {
        channelSlug,
        paymentMethodId,
        setupIntentId,
        userId: event.user.id,
      });

      return tokenizationResponse({
        id: paymentMethodId,
        result: "SUCCESSFULLY_TOKENIZED",
      });
    },
  ),
);
