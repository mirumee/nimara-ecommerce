import type Stripe from "stripe";

import { type Logger } from "@nimara/infrastructure/logging/types";

import { STRIPE_SETUP_USAGE, StripeMetaKey } from "@/domain/consts";
import { buildGatewayMetadata } from "@/domain/event-mapping";
import {
  type PaymentMethodRepository,
  paymentMethodTokenizationDataSchema,
} from "@/domain/payment-method";
import { getStripeApi } from "@/infrastructure/utils";

import {
  getDefaultPaymentMethodId,
  serializeStoredPaymentMethod,
} from "./serializers";
import {
  getExpandableId,
  isResourceMissing,
  mapSetupIntentStatusToProcessResult,
} from "./utils";

const FETCH_LIMIT = 50;

export type StripePaymentMethodRepositoryFactory = (opts: {
  appId: string;
  channelSlug: string;
  environment: string;
  logger: Logger;
  publicKey: string;
  saleorDomain: string;
  secretKey: string;
}) => PaymentMethodRepository;

export const stripePaymentMethodRepository: StripePaymentMethodRepositoryFactory =
  ({
    appId,
    channelSlug,
    environment,
    logger,
    publicKey,
    saleorDomain,
    secretKey,
  }) => {
    const stripe = getStripeApi(secretKey);

    const metadata = (userId: string) =>
      buildGatewayMetadata({
        appId,
        environment,
        metadata: {
          [StripeMetaKey.CHANNEL_SLUG]: channelSlug,
          [StripeMetaKey.SALEOR_DOMAIN]: saleorDomain,
          [StripeMetaKey.SALEOR_USER_ID]: userId,
        },
      });

    const initializeCreate: PaymentMethodRepository["create"] = async ({
      gatewayUserId,
      userId,
    }) => {
      const setupIntent = await stripe.setupIntents.create({
        automatic_payment_methods: { enabled: true },
        customer: gatewayUserId,
        metadata: metadata(userId),
        usage: STRIPE_SETUP_USAGE,
      });

      /**
       * The card is collected and confirmed in the storefront against this
       * secret; the resulting payment method is only known once the finalize
       * call runs.
       */
      return {
        data: {
          publishableKey: publicKey,
          setupIntent: { clientSecret: setupIntent.client_secret },
        },
        id: setupIntent.id,
        result: "ADDITIONAL_ACTION_REQUIRED",
      };
    };

    const finalizeCreate = async ({
      data,
      sessionId,
      userId,
    }: {
      data: unknown;
      sessionId: string;
      userId: string;
    }) => {
      let setupIntent: Stripe.SetupIntent;

      try {
        setupIntent = await stripe.setupIntents.retrieve(sessionId);
      } catch (error) {
        if (isResourceMissing(error)) {
          logger.warning("Tokenization referenced an unknown setup intent.", {
            channelSlug,
            sessionId,
            userId,
          });

          return {
            error: "Tokenization session does not exist.",
            id: sessionId,
            result: "FAILED_TO_TOKENIZE" as const,
          };
        }

        throw error;
      }

      // The session id comes from the storefront; accept only intents we issued.
      if (setupIntent.metadata?.[StripeMetaKey.SALEOR_USER_ID] !== userId) {
        logger.warning("Tokenization referenced a foreign setup intent.", {
          channelSlug,
          sessionId,
          userId,
        });

        return {
          error: "Tokenization session does not belong to this user.",
          id: sessionId,
          result: "FAILED_TO_TOKENIZE" as const,
        };
      }

      const result = mapSetupIntentStatusToProcessResult(setupIntent.status);
      const paymentMethodId = getExpandableId(setupIntent.payment_method);

      if (result !== "SUCCESSFULLY_TOKENIZED" || !paymentMethodId) {
        return {
          error: setupIntent.last_setup_error?.message,
          // Repeating the session id lets the storefront retry after the action.
          id: sessionId,
          result:
            result === "SUCCESSFULLY_TOKENIZED"
              ? ("FAILED_TO_TOKENIZE" as const)
              : result,
        };
      }

      const customerId = getExpandableId(setupIntent.customer);
      const setAsDefault = paymentMethodTokenizationDataSchema.safeParse(
        data ?? {},
      ).data?.setAsDefault;

      if (customerId && setAsDefault) {
        await stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: paymentMethodId },
        });
      }

      return {
        id: paymentMethodId,
        result: "SUCCESSFULLY_TOKENIZED" as const,
      };
    };

    return {
      create: async ({ finalizeData, gatewayUserId, userId }) =>
        finalizeData
          ? finalizeCreate({ ...finalizeData, userId })
          : initializeCreate({ gatewayUserId, userId }),

      delete: async ({ gatewayUserId, paymentMethodId, userId }) => {
        try {
          const paymentMethod =
            await stripe.paymentMethods.retrieve(paymentMethodId);

          // Saleor does not enforce ownership, so it is checked before detaching.
          if (getExpandableId(paymentMethod.customer) !== gatewayUserId) {
            logger.warning("Delete requested for a foreign payment method.", {
              channelSlug,
              paymentMethodId,
              userId,
            });

            return {
              error: "Payment method does not belong to this user.",
              result: "FAILED_TO_DELETE",
            };
          }

          await stripe.paymentMethods.detach(paymentMethodId);
        } catch (error) {
          if (isResourceMissing(error)) {
            logger.warning("Payment method no longer exists in Stripe.", {
              channelSlug,
              paymentMethodId,
              userId,
            });

            return {
              error: "Payment method does not exist.",
              result: "FAILED_TO_DELETE",
            };
          }

          throw error;
        }

        return { result: "SUCCESSFULLY_DELETED" };
      },

      list: async ({ gatewayUserId, userId }) => {
        let paymentMethods: Stripe.PaymentMethod[];

        try {
          ({ data: paymentMethods } = await stripe.customers.listPaymentMethods(
            gatewayUserId,
            { expand: ["data.customer"], limit: FETCH_LIMIT },
          ));
        } catch (error) {
          if (isResourceMissing(error)) {
            logger.warning("Gateway user no longer exists in Stripe.", {
              channelSlug,
              gatewayUserId,
              userId,
            });

            return [];
          }

          throw error;
        }

        const defaultPaymentMethodId =
          getDefaultPaymentMethodId(paymentMethods);

        return paymentMethods
          .map((paymentMethod) =>
            serializeStoredPaymentMethod({
              defaultPaymentMethodId,
              paymentMethod,
            }),
          )
          .filter((paymentMethod) => paymentMethod !== null);
      },
    };
  };
