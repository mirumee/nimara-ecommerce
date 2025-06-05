import { type Collection } from "@nimara/domain/objects/Collection";
import { type AsyncResult } from "@nimara/domain/objects/Result";

import { type FetchOptions } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";

export type SaleorCollectionServiceConfig = {
  apiURI: string;
  logger: Logger;
};

export type PageInfo =
  | {
      after?: string | null;
      before?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      type: "cursor";
    }
  | {
      currentPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      type: "numeric";
    };

export type WithFetchOptions = { options?: FetchOptions };

type CollectionDetailsOptions = {
  after?: string;
  before?: string;
  channel: string;
  languageCode?: string;
  limit: number;
  slug: string;
} & WithFetchOptions;

export type GetCollectionDetailsInfra = (
  opts: CollectionDetailsOptions,
) => AsyncResult<{
  pageInfo: PageInfo;
  results: Collection | null;
}>;

export type GetCollectionDetailsUseCase = GetCollectionDetailsInfra;

type CollectionsIDsBySlugsOptions = {
  channel: string;
  slugs: string[];
} & WithFetchOptions;

export type GetCollectionsIDsBySlugsInfra = (
  opts: CollectionsIDsBySlugsOptions,
) => AsyncResult<Collection["id"][] | null>;

export type CollectionService = {
  getCollectionDetails: GetCollectionDetailsUseCase;
  getCollectionsIDsBySlugs: GetCollectionsIDsBySlugsInfra;
};
