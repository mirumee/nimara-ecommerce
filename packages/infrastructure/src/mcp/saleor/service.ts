import { graphqlClient } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";
import { type ACPService } from "#root/mcp/types";

import { checkoutSessionCompleteInfra } from "./infrastructure/checkout-session-complete-infra";
import { checkoutSessionCreateInfra } from "./infrastructure/checkout-session-create-infra";
import { checkoutSessionGetInfra } from "./infrastructure/checkout-session-get-infra";
import { checkoutSessionUpdateInfra } from "./infrastructure/checkout-session-update-infra";
import { getProductFeedInfra } from "./infrastructure/get-product-feed";

export const saleorAcPService = (config: {
  apiUrl: string;
  channel: string;
  logger: Logger;
  storefrontUrl: string;
}) =>
  ({
    completeCheckoutSession: async (input) => {
      const saleorGraphqlClient = graphqlClient(config.apiUrl);

      return checkoutSessionCompleteInfra({
        deps: {
          graphqlClient: saleorGraphqlClient,
          logger: config.logger,
        },
        input,
      });
    },
    createCheckoutSession: async ({ input }) => {
      const saleorGraphqlClient = graphqlClient(config.apiUrl);

      return checkoutSessionCreateInfra({
        deps: {
          graphqlClient: saleorGraphqlClient,
          storefrontUrl: config.storefrontUrl,
          logger: config.logger,
          channel: config.channel,
        },
        input,
      });
    },
    getCheckoutSession: async (input) => {
      const saleorGraphqlClient = graphqlClient(config.apiUrl);

      return checkoutSessionGetInfra({
        deps: {
          graphqlClient: saleorGraphqlClient,
          logger: config.logger,
          storefrontUrl: config.storefrontUrl,
        },
        input,
      });
    },
    updateCheckoutSession: async (input) => {
      const saleorGraphqlClient = graphqlClient(config.apiUrl);

      return checkoutSessionUpdateInfra({
        deps: { graphqlClient: saleorGraphqlClient, logger: config.logger },
        input,
      });
    },
    getProductFeed: async (args) => {
      const saleorGraphqlClient = graphqlClient(config.apiUrl);

      return getProductFeedInfra({
        deps: {
          graphqlClient: saleorGraphqlClient,
          logger: config.logger,
          storefrontUrl: config.storefrontUrl,
        },
        input: args,
      });
    },
  }) satisfies ACPService;
