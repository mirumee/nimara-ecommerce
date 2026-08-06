import { type Stripe } from "stripe";

import { type PaymentGatewayConfig } from "@/lib/saleor/config/schema";

/**
 * The account id is captured when the channel is configured. A configuration
 * saved before that, or with a key that may not read the account, asks Stripe
 * for it instead.
 */
export const resolveStripeAccountId = async ({
  gatewayConfig,
  stripe,
}: {
  gatewayConfig: PaymentGatewayConfig[string];
  stripe: Stripe;
}): Promise<string> =>
  gatewayConfig.accountId ?? (await stripe.accounts.retrieve()).id;
