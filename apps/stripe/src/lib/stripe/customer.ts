import { type Stripe } from "stripe";

import { type Logger } from "@nimara/infrastructure/logging/types";

import { CONFIG } from "@/config";
import { UserPrivateMetadataUpdateMutationDocument } from "@/graphql/mutations/generated";
import { type SaleorClient } from "@/lib/saleor/client";
import {
  type SaleorMetadataItem,
  serializeMetadataItems,
} from "@/lib/saleor/metadata";
import { getGatewayCustomerMetadataKey } from "@/lib/saleor/payment-method/const";

import { StripeMetaKey } from "./const";
import { getGatewayMetadata } from "./util";

export type SaleorWebhookUser = {
  email: string;
  firstName?: string | null;
  id: string;
  lastName?: string | null;
  privateMetadata: readonly SaleorMetadataItem[];
};

type CustomerResolveOpts = {
  accountId: string;
  channelSlug: string;
  user: SaleorWebhookUser;
};

export const findGatewayCustomerId = ({
  accountId,
  channelSlug,
  user,
}: CustomerResolveOpts): string | null =>
  serializeMetadataItems(user.privateMetadata)[
    getGatewayCustomerMetadataKey({ accountId, channelSlug })
  ] ?? null;

const persistCustomerId = async ({
  accountId,
  channelSlug,
  customerId,
  logger,
  saleorClient,
  userId,
}: {
  accountId: string;
  channelSlug: string;
  customerId: string;
  logger: Logger;
  saleorClient: SaleorClient;
  userId: string;
}) => {
  const { updatePrivateMetadata } = await saleorClient.execute(
    UserPrivateMetadataUpdateMutationDocument,
    {
      variables: {
        id: userId,
        input: [
          {
            key: getGatewayCustomerMetadataKey({ accountId, channelSlug }),
            value: customerId,
          },
        ],
      },
    },
  );

  const errors = updatePrivateMetadata?.errors ?? [];

  if (errors.length) {
    logger.error("Failed to persist the gateway customer id in Saleor.", {
      channelSlug,
      customerId,
      errors,
      userId,
    });
  }
};

export const resolveGatewayCustomerId = async ({
  accountId,
  channelSlug,
  logger,
  saleorClient,
  saleorDomain,
  stripe,
  user,
}: CustomerResolveOpts & {
  logger: Logger;
  saleorClient: SaleorClient;
  saleorDomain: string;
  stripe: Stripe;
}): Promise<string> => {
  const ownedCustomerId = findGatewayCustomerId({
    accountId,
    channelSlug,
    user,
  });

  if (ownedCustomerId) {
    return ownedCustomerId;
  }

  const customer = await stripe.customers.create(
    {
      email: user.email,
      name: [user.firstName, user.lastName].filter(Boolean).join(" "),
      metadata: getGatewayMetadata({
        channelSlug,
        saleorDomain,
        [StripeMetaKey.SALEOR_USER_ID]: user.id,
      }),
    },
    {
      idempotencyKey: `customer:${CONFIG.APP_ID}:${saleorDomain}:${channelSlug}:${user.id}`,
    },
  );

  await persistCustomerId({
    accountId,
    channelSlug,
    customerId: customer.id,
    logger,
    saleorClient,
    userId: user.id,
  });

  return customer.id;
};
