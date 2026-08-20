import Stripe from "stripe";

import { type Logger } from "@nimara/infrastructure/logging/types";

import { STRIPE_API_VERSION } from "@/domain/consts";

export const getStripeApi = (apiKey: string) =>
  new Stripe(apiKey, { apiVersion: STRIPE_API_VERSION });

export type StripeApiFactory = typeof getStripeApi;

export const resolveStripeAccountId = async ({
  logger,
  secretKey,
}: {
  logger: Logger;
  secretKey: string;
}): Promise<string | undefined> => {
  try {
    return (await getStripeApi(secretKey).accounts.retrieve()).id;
  } catch (error) {
    logger.warning("Failed to read the Stripe account id.", {
      errors: error instanceof Error ? [{ message: error.message }] : [],
    });

    return undefined;
  }
};
