import type { LanguageCodeEnum } from "@nimara/codegen/schema";
import type { Menu } from "@nimara/domain/objects/Menu";
import { type AsyncResult } from "@nimara/domain/objects/Result";

import type { FetchOptions } from "#root/graphql/client";
export type WithFetchOptions = { options?: FetchOptions };

type CMSMenuSlug = "navbar" | "footer";

type CMSMenuOptions = {
  channel: string;
  id?: string;
  languageCode: LanguageCodeEnum;
  locale?: string;
  slug?: CMSMenuSlug;
} & WithFetchOptions;

export type CMSMenuGetInfra = (
  opts: CMSMenuOptions,
) => AsyncResult<{ menu: Menu } | null>;

export type CMSMenuGetUseCase = CMSMenuGetInfra;

export type CMSMenuService = {
  menuGet: CMSMenuGetUseCase;
};
