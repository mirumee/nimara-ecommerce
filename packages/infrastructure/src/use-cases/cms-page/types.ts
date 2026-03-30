import type { CMSPage, PageType } from "@nimara/domain/objects/CMSPage";
import { type AsyncResult } from "@nimara/domain/objects/Result";

import type { FetchOptions } from "#root/graphql/client";

export type WithFetchOptions = { options?: FetchOptions };

type CMSPageOptions = {
  /** When set (e.g. Saleor app token), used to load pages not visible to anonymous API (unpublished). */
  accessToken?: string | null;
  languageCode: string;
  pageType?: PageType;
  slug: string;
} & WithFetchOptions;

export type CMSPageGetInfra = (
  opts: CMSPageOptions,
) => AsyncResult<CMSPage | null>;

export type CMSPageGetUseCase = CMSPageGetInfra;

export type CMSPageService = {
  cmsPageGet: CMSPageGetUseCase;
};
