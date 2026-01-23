"use client";

import { useTranslations } from "next-intl";

import { Link as LocalizedLink } from "@nimara/i18n/routing";

import { paths } from "@/foundation/routing/paths";

export const ResetPasswordLink = () => {
  const t = useTranslations("auth");

  return (
    <LocalizedLink
      className="float-right px-3 text-sm hover:underline"
      href={paths.resetPassword.asPath()}
    >
      {t("i-forgot-my-password")}
    </LocalizedLink>
  );
};
