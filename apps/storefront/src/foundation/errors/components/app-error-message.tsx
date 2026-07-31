"use client";

import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { LocalizedLink } from "@nimara/i18n/routing";
import { type MessagePath } from "@nimara/i18n/types";

import { clientEnvs } from "@/envs/client";

/**
 * Some error copy carries a `<link>` contact tag, so codes must render through
 * `t.rich`. Plain `t()` throws on the markup and falls back to printing the raw
 * message path.
 */
export const AppErrorMessage = ({ code }: { code: AppErrorCode }) => {
  const t = useTranslations();

  return t.rich(`errors.${code}` as MessagePath, {
    link: (chunks: ReactNode) => (
      <LocalizedLink
        href={`mailto:${clientEnvs.NEXT_PUBLIC_DEFAULT_EMAIL}`}
        className="underline"
        target="_blank"
      >
        {chunks}
      </LocalizedLink>
    ),
  });
};
