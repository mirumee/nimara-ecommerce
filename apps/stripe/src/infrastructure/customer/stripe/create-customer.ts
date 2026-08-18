import { StripeMetaKey } from "@/domain/consts";
import { type CustomerRepository } from "@/domain/customer";
import { buildGatewayMetadata } from "@/domain/event-mapping";
import { getStripeApi } from "@/infrastructure/utils";

export const createCustomerInfra =
  ({
    appId,
    channelSlug,
    environment,
    saleorDomain,
    secretKey,
  }: {
    appId: string;
    channelSlug: string;
    environment: string;
    saleorDomain: string;
    secretKey: string;
  }): CustomerRepository["create"] =>
  async ({ user }) => {
    const customer = await getStripeApi(secretKey).customers.create(
      {
        email: user.email,
        name: [user.firstName, user.lastName].filter(Boolean).join(" "),
        metadata: buildGatewayMetadata({
          appId,
          environment,
          metadata: {
            [StripeMetaKey.CHANNEL_SLUG]: channelSlug,
            [StripeMetaKey.SALEOR_DOMAIN]: saleorDomain,
            [StripeMetaKey.SALEOR_USER_ID]: user.id,
          },
        }),
      },
      {
        // Concurrent first payments of one shopper collapse into one customer.
        idempotencyKey: `customer:${appId}:${saleorDomain}:${channelSlug}:${user.id}`,
      },
    );

    return customer.id;
  };
