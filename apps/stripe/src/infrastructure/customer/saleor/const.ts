const GATEWAY_CUSTOMER_METADATA_NAMESPACE = "stripe.customer";

export const getGatewayCustomerMetadataKey = ({
  accountId,
  channelSlug,
}: {
  accountId: string;
  channelSlug: string;
}) => `${GATEWAY_CUSTOMER_METADATA_NAMESPACE}.${channelSlug}.${accountId}`;
