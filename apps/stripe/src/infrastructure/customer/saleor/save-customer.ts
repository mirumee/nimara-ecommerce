import { type Logger } from "@nimara/infrastructure/logging/types";

import { type CustomerRepository } from "@/domain/customer";
import { type SaleorClient } from "@/lib/saleor/client";

import { getGatewayCustomerMetadataKey } from "./const";

export const saveCustomerInfra =
  ({
    accountId,
    channelSlug,
    logger,
    saleorClient,
  }: {
    accountId: string;
    channelSlug: string;
    logger: Logger;
    saleorClient: SaleorClient;
  }): CustomerRepository["save"] =>
  async ({ gatewayUserId, userId }) => {
    const result = await saleorClient.updateUserPrivateMetadata({
      id: userId,
      input: [
        {
          key: getGatewayCustomerMetadataKey({ accountId, channelSlug }),
          value: gatewayUserId,
        },
      ],
    });

    const errors = result?.errors ?? [];

    if (errors.length) {
      logger.error("Failed to persist the gateway user id in Saleor.", {
        channelSlug,
        errors,
        gatewayUserId,
        userId,
      });
    }
  };
