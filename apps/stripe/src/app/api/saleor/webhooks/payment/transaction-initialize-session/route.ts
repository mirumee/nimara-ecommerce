import Stripe from "stripe";

import { type TransactionFlowStrategyEnum } from "@nimara/codegen/schema";
import { type Logger } from "@nimara/infrastructure/logging/types";

import { type TransactionInitializeSessionSubscription } from "@/graphql/subscriptions/generated";
import { getAmountFromCents, getCentsFromAmount } from "@/lib/currency";
import { isError } from "@/lib/error";
import { resolveAppConfigForChannel } from "@/lib/saleor/config/context";
import {
  parseTransactionInitializeData,
  type TransactionEventSchema,
} from "@/lib/saleor/transaction/schema";
import { constructTransactionEventResponse } from "@/lib/saleor/transaction/util";
import { verifySaleorWebhookRoute } from "@/lib/saleor/webhooks/api";
import { resolveStripeAccountId } from "@/lib/stripe/account";
import { getStripeApi, stripeRouteErrorsHandler } from "@/lib/stripe/api";
import { STRIPE_SETUP_USAGE } from "@/lib/stripe/const";
import { resolveGatewayCustomerId } from "@/lib/stripe/customer";
import { getExpandableId } from "@/lib/stripe/payment-method";
import {
  getGatewayMetadata,
  getIntentDashboardUrl,
  getIntentShipping,
  mapStatusToActionType,
} from "@/lib/stripe/util";
import { getLoggingProvider } from "@/providers/logging";
import { getSaleorClient } from "@/providers/saleor";

const EVENT_TYPE = "TransactionInitializeSession";

/**
 * Reports a refused payment as a transaction event rather than an error
 * response. A synchronous payment webhook that answers non-2xx reads as a
 * delivery problem, which leaves the transaction in its previous state and
 * tells the shopper nothing.
 */
const transactionFailure =
  ({
    actionType,
    amount,
    logger,
  }: {
    actionType: TransactionFlowStrategyEnum;
    amount: string;
    logger: Logger;
  }) =>
  (message: string): Response =>
    constructTransactionEventResponse({
      data: { amount, message, result: `${actionType}_FAILURE` },
      logger,
      type: EVENT_TYPE,
    });

export const POST = stripeRouteErrorsHandler(
  verifySaleorWebhookRoute<TransactionInitializeSessionSubscription>(
    async ({ event, headers }) => {
      const logger = getLoggingProvider();

      const saleorDomain = headers["saleor-domain"];
      const channelSlug = event.sourceObject.channel.slug;
      const { actionType } = event.action;
      const { config, response } = await resolveAppConfigForChannel({
        channelSlug,
        saleorDomain,
      });

      if (!config) {
        return response;
      }

      const { authToken, gatewayConfig } = config;
      const stripe = getStripeApi(gatewayConfig.secretKey);
      const data = parseTransactionInitializeData(event.data);
      const user = event.sourceObject.user;

      const failure = transactionFailure({
        actionType,
        amount: getAmountFromCents(event.sourceObject.total.gross),
        logger,
      });

      const needsCustomer = !!data.paymentMethodId || !!data.saveForFutureUse;
      let customerId: string | null = null;

      /**
       * Every payment by a signed-in shopper is attached to their gateway
       * customer, so the provider keeps one payment history per shopper and
       * fraud signals can use it. Guest payments stay customer-less, and a
       * guest therefore cannot keep or reuse a payment method.
       */
      if (user) {
        customerId = await resolveGatewayCustomerId({
          accountId: await resolveStripeAccountId({ gatewayConfig, stripe }),
          channelSlug,
          logger,
          saleorClient: getSaleorClient({ authToken, logger, saleorDomain }),
          saleorDomain,
          stripe,
          user,
        });
      } else if (needsCustomer) {
        logger.warning("Stored payment method requested without a user.", {
          channelSlug,
          transactionId: event.transaction.id,
        });

        return failure("Saved payment methods require a signed in customer.");
      }

      /**
       * The payment method id travels from the storefront, so paying with it
       * is only allowed once it is confirmed to belong to this customer.
       */
      if (data.paymentMethodId) {
        let paymentMethod: Stripe.PaymentMethod;

        try {
          paymentMethod = await stripe.paymentMethods.retrieve(
            data.paymentMethodId,
          );
        } catch (err) {
          if (
            isError(err, Stripe.errors.StripeInvalidRequestError) &&
            err.code === "resource_missing"
          ) {
            logger.warning(
              "Payment attempted with an unknown payment method.",
              {
                channelSlug,
                paymentMethodId: data.paymentMethodId,
                transactionId: event.transaction.id,
                userId: user?.id,
              },
            );

            return failure("Payment method does not exist.");
          }

          throw err;
        }

        if (getExpandableId(paymentMethod.customer) !== customerId) {
          logger.warning("Payment attempted with a foreign payment method.", {
            channelSlug,
            paymentMethodId: data.paymentMethodId,
            transactionId: event.transaction.id,
            userId: user?.id,
          });

          return failure("Payment method does not belong to this customer.");
        }
      }

      const shipping = getIntentShipping(event.sourceObject.shippingAddress);

      const intent = await stripe.paymentIntents.create({
        amount: getCentsFromAmount(event.sourceObject.total.gross),
        automatic_payment_methods: { enabled: true },
        capture_method: actionType === "CHARGE" ? "automatic" : "manual",
        currency: event.sourceObject.total.gross.currency,
        ...(shipping && { shipping }),
        metadata: getGatewayMetadata({
          ...data.metadata,
          channelSlug,
          saleorDomain,
          transactionId: event.transaction.id,
        }),
        ...(customerId && { customer: customerId }),
        ...(data.paymentMethodId && { payment_method: data.paymentMethodId }),
        ...(data.saveForFutureUse && {
          setup_future_usage: STRIPE_SETUP_USAGE,
        }),
        /**
         * An agent-granted credential from Stripe's agentic commerce preview,
         * which the agentic checkout flow completes with.
         */
        ...(data.sharedPaymentToken && {
          shared_payment_token: data.sharedPaymentToken,
        }),
      });

      const result = mapStatusToActionType({
        actionType,
        status: intent.status,
      });
      const responseData: TransactionEventSchema = {
        pspReference: intent.id,
        result,
        amount: getAmountFromCents({
          currency: intent.currency,
          amount: intent.amount,
        }),
        message: intent.last_payment_error?.code ?? null,
        data: {
          paymentIntent: {
            clientSecret: intent.client_secret,
            publishableKey: gatewayConfig.publicKey,
            time: intent.created,
            externalUrl: getIntentDashboardUrl({
              paymentId: intent.id,
              secretKey: gatewayConfig.secretKey,
            }),
          },
        },
      };

      return constructTransactionEventResponse({
        data: responseData,
        logger,
        type: EVENT_TYPE,
      });
    },
  ),
);
