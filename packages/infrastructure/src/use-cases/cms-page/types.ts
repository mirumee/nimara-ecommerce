import type { LanguageCodeEnum } from "@nimara/codegen/schema";
import type { CMSPage, PageType } from "@nimara/domain/objects/CMSPage";

import type { FetchOptions } from "#root/graphql/client";

export type WithFetchOptions = { options?: FetchOptions };

type CMSPageOptions = {
  languageCode: LanguageCodeEnum;
  pageType?: PageType;
  slug: string;
} & WithFetchOptions;

export type CMSPageGetInfra = (opts: CMSPageOptions) => Promise<CMSPage | null>;

export type CMSPageGetUseCase = CMSPageGetInfra;

export type CMSPageService = {
  cmsPageGet: CMSPageGetUseCase;
};
