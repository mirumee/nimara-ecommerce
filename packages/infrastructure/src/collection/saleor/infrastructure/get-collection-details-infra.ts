import { type LanguageCodeEnum } from "@nimara/codegen/schema";
import { err, ok } from "@nimara/domain/objects/Result";

import { THUMBNAIL_FORMAT, THUMBNAIL_SIZE_LARGE } from "#root/config";
import { graphqlClient } from "#root/graphql/client";

import {
  type GetCollectionDetailsInfra,
  type SaleorCollectionServiceConfig,
} from "../../types";
import { CollectionDetailsQueryDocument } from "../graphql/queries/generated";
import { collectionSerializer } from "./serializers";

export const getCollectionDetailsInfra =
  ({
    apiURI,
    logger,
  }: SaleorCollectionServiceConfig): GetCollectionDetailsInfra =>
  async ({ slug, options, channel, languageCode, after, before, limit }) => {
    const pageInfo = before
      ? { before, last: limit, first: undefined }
      : after
        ? { after, first: limit, last: undefined }
        : { first: limit, last: undefined };

    try {
      logger.debug("Fetching the collection from Saleor", {
        slug,
        channel,
        languageCode,
      });

      const result = await graphqlClient(apiURI).execute(
        CollectionDetailsQueryDocument,
        {
          variables: {
            channel,
            languageCode: languageCode as LanguageCodeEnum,
            slug,
            after,
            before,
            thumbnailFormat: THUMBNAIL_FORMAT,
            thumbnailSize: THUMBNAIL_SIZE_LARGE,
            ...pageInfo,
          },
          operationName: "CollectionDetailsQuery",
          options,
        },
      );

      if (!result.ok) {
        logger.error("Failed to fetch collection from Saleor", {
          error: result.errors,
        });

        return result;
      }

      const collection = result.data.collection;

      if (!collection) {
        return ok({
          results: null,
          pageInfo: {
            type: "cursor",
            after: null,
            before: null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
      }

      return ok({
        results: collectionSerializer(collection),
        pageInfo: {
          type: "cursor",
          after: result?.data.collection?.products?.pageInfo.endCursor,
          before: result.data?.collection?.products?.pageInfo.startCursor,
          hasNextPage:
            result.data?.collection?.products?.pageInfo.hasNextPage ?? false,
          hasPreviousPage:
            result.data?.collection?.products?.pageInfo.hasPreviousPage ??
            false,
        },
      });
    } catch (e) {
      logger.error("Unexpected error while fetching collection from Saleor", {
        error: e,
      });

      return err([
        {
          code: "UNEXPECTED_HTTP_ERROR",
          message: "Unexpected error while fetching collection from Saleor",
        },
      ]);
    }
  };
