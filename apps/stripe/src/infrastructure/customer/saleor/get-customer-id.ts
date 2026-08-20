import { type CustomerRepository } from "@/domain/customer";
import { serializeMetadataItems } from "@/lib/saleor/metadata";

import { getGatewayCustomerMetadataKey } from "./const";

// Reads the mapping off the user private metadata Saleor delivers in webhooks.
export const getCustomerIdInfra =
  ({
    accountId,
    channelSlug,
  }: {
    accountId: string;
    channelSlug: string;
  }): CustomerRepository["get"] =>
  async ({ user }) =>
    serializeMetadataItems(user.privateMetadata)[
      getGatewayCustomerMetadataKey({ accountId, channelSlug })
    ] ?? null;
