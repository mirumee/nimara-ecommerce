"use client";

import { useTranslations } from "next-intl";

import { useCookieSettings } from "./use-cookie-settings";

export const CookieSettingsTrigger = () => {
  const t = useTranslations("footer");
  const { open } = useCookieSettings();

  return (
    <button type="button" className="hover:underline" onClick={open}>
      {t("cookie-settings")}
    </button>
  );
};
