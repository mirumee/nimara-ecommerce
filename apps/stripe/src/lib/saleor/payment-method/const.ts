export const GATEWAY_CUSTOMER_METADATA_NAMESPACE = "stripe.customer";

/**
 * Channel-scoped because each channel may use a different Stripe account.
 */
export const getGatewayCustomerMetadataKey = (channelSlug: string) =>
  `${GATEWAY_CUSTOMER_METADATA_NAMESPACE}.${channelSlug}`;

export const TOKENIZED_PAYMENT_FLOW = ["INTERACTIVE"] as const;
