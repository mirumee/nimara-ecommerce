import type { NamespaceKeys, NestedKeyOf } from "next-intl";
import type { getTranslations } from "next-intl/server";

export type GetTranslations<Namespace extends TranslationNamespace = never> =
  Awaited<ReturnType<typeof getTranslations<Namespace>>>;

export type TranslationNamespace = NamespaceKeys<
  IntlMessages,
  NestedKeyOf<IntlMessages>
>;

export type TranslationMessage<Namespace extends TranslationNamespace = never> =
  Parameters<GetTranslations<Namespace>>[0];

export type ServerError = { code: string };
