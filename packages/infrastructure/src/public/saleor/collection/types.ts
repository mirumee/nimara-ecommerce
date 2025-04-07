import { type Collection } from "@nimara/domain/objects/Collection";
import { type AsyncResult } from "@nimara/domain/objects/Result";

import { type FetchOptions } from "#root/graphql/client";

export type SaleorCollectionServiceConfig = {
  apiURI: string;
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
  slug?: string;
} & WithFetchOptions;

export type GetCollectionDetailsInfra = (
  opts: CollectionDetailsOptions,
) => AsyncResult<{
  pageInfo: PageInfo;
  results: Collection | null;
}>;

export type GetCollectionDetailsUseCase = GetCollectionDetailsInfra;

export type CollectionService = {
  getCollectionDetails: GetCollectionDetailsUseCase;
};
