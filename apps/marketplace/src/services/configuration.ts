import type { AsyncResult } from "@nimara/domain/objects/Result";

import {
  type Channels,
  ChannelsDocument,
  type Me,
  MeDocument,
  type Warehouses,
  WarehousesDocument,
} from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";

/**
 * Service for marketplace configuration operations.
 * Handles user profile, channels, and warehouse management.
 */
class ConfigurationService {
  async getMe(token?: string | null): AsyncResult<Me> {
    return executeGraphQL(MeDocument, "MeQuery", undefined, token);
  }

  async getChannels(token?: string | null): AsyncResult<Channels> {
    return executeGraphQL(ChannelsDocument, "ChannelsQuery", undefined, token);
  }

  async getWarehouses(token?: string | null): AsyncResult<Warehouses> {
    return executeGraphQL(
      WarehousesDocument,
      "WarehousesQuery",
      undefined,
      token,
    );
  }
}

export const configurationService = new ConfigurationService();
