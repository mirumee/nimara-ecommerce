import { ok } from "@nimara/domain/objects/Result";

import {
  type GetCollectionsIDsBySlugsInfra,
  type SaleorCollectionServiceConfig,
} from "#root/collection/types";
import { graphqlClient } from "#root/graphql/client";

import { CollectionsIDsBySlugsDocument } from "../graphql/queries/generated";

export const getCollectionsIDsBySlugsInfra =
  ({
    apiURI,
    logger,
  }: SaleorCollectionServiceConfig): GetCollectionsIDsBySlugsInfra =>
  async ({ channel, slugs, options }) => {
    if (!slugs || slugs.length === 0) {
      logger.debug(
        "No collection slugs provided, skipping fetching collections ID's from Saleor",
        {
          channel,
          slugs,
        },
      );

      return ok(null);
    }

    logger.debug("Fetching the collections ID's from Saleor", {
      slugs,
      channel,
    });

    const result = await graphqlClient(apiURI).execute(
      CollectionsIDsBySlugsDocument,
      {
        variables: {
          channel,
          slugs,
        },
        operationName: "CollectionsIDsBySlugsQuery",
        options,
      },
    );

    if (!result.ok) {
      logger.error("Failed to fetch collections ID's from Saleor", {
        error: result.errors,
        slugs,
        channel,
      });

      return result;
    }

    const collections = result.data.collections;

    if (!collections) {
      return ok(null);
    }

    return ok(collections.edges.map((edge) => edge.node.id));
  };
