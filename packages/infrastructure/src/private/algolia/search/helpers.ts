import { invariant } from "graphql/jsutils/invariant";

import { loggingService } from "@nimara/infrastructure/logging/service";

import { type IndicesSettings } from "./types";

export const getIndexName = (
  indicesSettings: IndicesSettings,
  channel: string,
  sortByParam?: string,
): string => {
  // This can be extended beyond just comparing a channel, e.g. by comparing language/currency/entity etc.
  const channelIndex = indicesSettings.find(
    (index) => index.channel === channel,
  );

  invariant(channelIndex, `Missing Algolia index for channel: ${channel}`);

  if (!sortByParam) {
    return channelIndex.indexName;
  }

  const replica = channelIndex.virtualReplicas.find(
    (replica) => replica.queryParamValue === sortByParam,
  );

  if (!replica) {
    loggingService.error(
      "Missing virtual replica of given index for given sortBy parameter. Returning a main index.",
      { indexName: channelIndex.indexName, sortByParam },
    );

    return channelIndex.indexName;
  }

  return replica.indexName;
};
