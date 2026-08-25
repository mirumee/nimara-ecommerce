import { err, ok } from "@nimara/domain/objects/Result";
import { type Logger } from "@nimara/infrastructure/logging/types";

import { type CustomerRepository } from "@/domain/customer";
import { type SaleorClient } from "@/infrastructure/saleor/client";

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

    const log = (errors: unknown) =>
      logger.error("Failed to persist the gateway user id in Saleor.", {
        channelSlug,
        errors,
        gatewayUserId,
        userId,
      });

    if (!result.ok) {
      log(result.errors);

      return result;
    }

    const errors = result.data?.errors ?? [];

    if (errors.length) {
      log(errors);

      return err([
        {
          code: "UNKNOWN_ERROR",
          message: "Saleor refused the gateway user id update.",
        },
      ]);
    }

    return ok(undefined);
  };
