import type { LanguageCodeEnum } from "@nimara/codegen/schema";
import type { Menu } from "@nimara/domain/objects/Menu";

import type { FetchOptions } from "#root/graphql/client";
export type WithFetchOptions = { options?: FetchOptions };

type CMSMenuSlug = "navbar" | "footer";

type CMSMenuOptions = {
  channel: string;
  id?: string;
  languageCode: LanguageCodeEnum;
  slug?: CMSMenuSlug;
} & WithFetchOptions;

export type CMSMenuGetInfra = (
  opts: CMSMenuOptions,
) => Promise<{ menu: Menu } | null>;

export type CMSMenuGetUseCase = CMSMenuGetInfra;

export type CMSMenuService = {
  menuGet: CMSMenuGetUseCase;
};
