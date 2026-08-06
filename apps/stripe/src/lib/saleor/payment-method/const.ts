export const GATEWAY_CUSTOMER_METADATA_NAMESPACE = "stripe.customer";

/**
 * Scoped to the channel and to the account behind it. A customer id only
 * exists in the Stripe account that created it, so swapping the account for a
 * channel must not resolve the mapping made for the previous one.
 */
export const getGatewayCustomerMetadataKey = ({
  accountId,
  channelSlug,
}: {
  accountId: string;
  channelSlug: string;
}) => `${GATEWAY_CUSTOMER_METADATA_NAMESPACE}.${channelSlug}.${accountId}`;

export const TOKENIZED_PAYMENT_FLOW = ["INTERACTIVE"] as const;
