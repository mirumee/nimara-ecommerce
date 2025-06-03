import { err, ok } from "@nimara/domain/objects/Result";

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
    try {
      logger.debug("Fetching the collections ID's from Saleor", {
        slugs,
        channel,
      });

      if (!slugs || slugs.length === 0) {
        return ok({ results: null });
      }

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
        });

        return result;
      }

      const collections = result.data.collections;

      if (!collections) {
        return ok({
          results: null,
        });
      }

      return ok({
        results: collections.edges.map((edge) => edge.node.id),
      });
    } catch (e) {
      logger.error(
        "Unexpected error while fetching collections ID's from Saleor",
        {
          error: e,
        },
      );

      return err([
        {
          code: "UNEXPECTED_HTTP_ERROR",
          message: "Unexpected error while fetching collection from Saleor",
        },
      ]);
    }
  };
