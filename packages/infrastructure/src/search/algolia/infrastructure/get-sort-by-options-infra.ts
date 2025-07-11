import { ok } from "@nimara/domain/objects/Result";
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
      return ok([]);
    }

    return ok(
      index.virtualReplicas.map((replica) => ({
        messageKey: replica.messageKey,
        value: replica.queryParamValue,
      })),
    );
  };
};
