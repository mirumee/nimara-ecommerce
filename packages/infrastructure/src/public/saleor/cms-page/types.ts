import type { LanguageCodeEnum } from "@nimara/codegen/schema";
import type { CMSPage } from "@nimara/domain/objects/CMSPage";

import type { FetchOptions } from "#root/graphql/client";

export type SaleorCMSPageServiceConfig = {
  apiURL: string;
};

export type WithFetchOptions = { options?: FetchOptions };

type CMSPageOptions = {
  languageCode: LanguageCodeEnum;
  slug: string;
} & WithFetchOptions;

export type CMSPageGetInfra = (opts: CMSPageOptions) => Promise<CMSPage | null>;

export type CMSPageGetUseCase = CMSPageGetInfra;

export type CMSPageService<Config> = (config: Config) => {
  cmsPageGet: CMSPageGetUseCase;
};
