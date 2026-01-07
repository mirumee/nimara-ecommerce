"use client";

import { useTranslations } from "next-intl";

import { useLocalizedLink } from "@nimara/foundation/i18n/hooks/use-localized-link";
import { paths } from "@/foundation/routing/paths";

export const ResetPasswordLink = () => {
  const t = useTranslations("auth");
  const LocalizedLink = useLocalizedLink();

  return (
    <LocalizedLink
      className="float-right px-3 text-sm hover:underline"
      href={paths.resetPassword.asPath()}
    >
      {t("i-forgot-my-password")}
    </LocalizedLink>
  );
};
