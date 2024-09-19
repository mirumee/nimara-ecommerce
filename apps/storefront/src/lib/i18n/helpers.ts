import type { ReactNode } from "react";

import type {
  GetTranslations,
  TranslationMessage,
  TranslationNamespace,
} from "@/types";

export const translateOrFallback = <
  Namespace extends TranslationNamespace = never,
>({
  t,
  path,
  fallback,
}: {
  fallback: TranslationMessage<Namespace> | ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  path: TranslationMessage<Namespace> & any;
  t: GetTranslations<Namespace>;
}): string | ReactNode => {
  const translatedMessage = t(path);

  /**
   * If translation will be missing the passed path will be returned from `t`.
   * EndsWith should succeed with check event if `t` was initiated with a namespace.
   */
  if (translatedMessage.endsWith(path as string)) {
    return typeof fallback === "string"
      ? t(fallback as TranslationMessage<Namespace>)
      : fallback;
  }

  return translatedMessage;
};
