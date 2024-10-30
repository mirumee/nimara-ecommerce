import type { GetSortByOptionsInfra } from "@nimara/infrastructure/use-cases/search/types";

import type { AlgoliaSearchServiceConfig } from "../types";

export const algoliaGetSortByOptionsInfra = (
  config: AlgoliaSearchServiceConfig,
): GetSortByOptionsInfra => {
  return (context) => {
    const index = config.settings.indices.find(
      (index) => index.channel === context.channel,
    );

    if (!index) {
      return {
        options: [],
      };
    }

    return {
      options: index.virtualReplicas.map((replica) => ({
        messageKey: replica.messageKey,
        value: replica.queryParamValue,
      })),
    };
  };
};
