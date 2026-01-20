import type { NamespaceKeys, NestedKeyOf, useTranslations } from "next-intl";

export type GetTranslations<Namespace extends TranslationNamespace = never> =
  Awaited<ReturnType<typeof useTranslations<Namespace>>>;

export type TranslationNamespace = NamespaceKeys<
  IntlMessages,
  NestedKeyOf<IntlMessages>
>;

export type TranslationMessage<Namespace extends TranslationNamespace = never> =
  Parameters<GetTranslations<Namespace>>[0];
