import Stripe from "stripe";

import { StripeWebhookEvent } from "./const";
import { getGatewayMetadata } from "./util";

export const getStripeApi = (apiKey: string) => new Stripe(apiKey);

export const webhookSubscribe = async ({
  apiKey,
  url,
  saleorDomain,
}: {
  apiKey: string;
  saleorDomain: string;
  url: string;
}) => {
  const stripe = getStripeApi(apiKey);

  return stripe.webhookEndpoints.create({
    url,
    enabled_events: Object.values(StripeWebhookEvent),
    metadata: getGatewayMetadata({ saleorDomain }),
  });
};

export const webhookDelete = async ({
  apiKey,
  id,
}: {
  apiKey: string;
  id: string;
}) => {
  const stripe = getStripeApi(apiKey);

  return stripe.webhookEndpoints.del(id);
};
