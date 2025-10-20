import { type LanguageCodeEnum } from "@nimara/codegen/schema";

import { type ACPService } from "#root/acp/types";
import { graphqlClient } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";
import { type StripePaymentService } from "#root/payment/providers";

import { checkoutSessionCompleteInfra } from "./infrastructure/checkout-session-complete-infra";
import { checkoutSessionCreateInfra } from "./infrastructure/checkout-session-create-infra";
import { checkoutSessionGetInfra } from "./infrastructure/checkout-session-get-infra";
import { checkoutSessionUpdateInfra } from "./infrastructure/checkout-session-update-infra";
import { getProductFeedInfra } from "./infrastructure/get-product-feed";

const DEFAULT_CHECKOUT_SESSION_CACHE_TIME = 5 * 60; // 5 minutes
const DEFAULT_CHECKOUT_SESSION_LANGUAGE = "EN" satisfies LanguageCodeEnum;

type Config = {
  apiUrl: string;
  cacheTTL?: {
    checkoutSession: number;
    productFeed: number;
  };
  channel: string;
  languageCode?: LanguageCodeEnum;
  logger: Logger;
  paymentService?: () => Promise<StripePaymentService>;
  storefrontUrl: string;
};

export const saleorACPService = ({
  apiUrl,
  cacheTTL = {
    checkoutSession: DEFAULT_CHECKOUT_SESSION_CACHE_TIME,
    productFeed: DEFAULT_CHECKOUT_SESSION_CACHE_TIME,
  },
  channel,
  languageCode = DEFAULT_CHECKOUT_SESSION_LANGUAGE,
  logger,
  paymentService,
  storefrontUrl,
}: Config) =>
  ({
    completeCheckoutSession: async (input) => {
      if (!paymentService) {
        throw new Error(
          "Payment service is required to complete the checkout session",
        );
      }

      const saleorGraphqlClient = graphqlClient(apiUrl);
      const service = await paymentService();

      return checkoutSessionCompleteInfra({
        deps: {
          graphqlClient: saleorGraphqlClient,
          logger,
          storefrontUrl,
          paymentService: service,
          cacheTTL: cacheTTL.checkoutSession,
          languageCode,
        },
        input,
      });
    },
    createCheckoutSession: async ({ input }) => {
      const saleorGraphqlClient = graphqlClient(apiUrl);

      return checkoutSessionCreateInfra({
        deps: {
          graphqlClient: saleorGraphqlClient,
          storefrontUrl,
          logger,
          channel,
          languageCode,
        },
        input,
      });
    },
    getCheckoutSession: async (input) => {
      const saleorGraphqlClient = graphqlClient(apiUrl);

      return checkoutSessionGetInfra({
        deps: {
          graphqlClient: saleorGraphqlClient,
          logger,
          storefrontUrl,
          languageCode,
          cacheTTL: cacheTTL.checkoutSession,
        },
        input,
      });
    },
    updateCheckoutSession: async (input) => {
      const saleorGraphqlClient = graphqlClient(apiUrl);

      return checkoutSessionUpdateInfra({
        deps: {
          graphqlClient: saleorGraphqlClient,
          logger,
          storefrontUrl,
          languageCode,
          cacheTTL: cacheTTL.checkoutSession,
        },
        input,
      });
    },
    getProductFeed: async (args) => {
      const saleorGraphqlClient = graphqlClient(apiUrl);

      return getProductFeedInfra({
        deps: {
          graphqlClient: saleorGraphqlClient,
          logger,
          storefrontUrl,
          cacheTTL: cacheTTL.productFeed,
        },
        input: args,
      });
    },
  }) satisfies ACPService;
