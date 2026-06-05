"use client";

import { useTranslations } from "next-intl";

import { useCookieSettings } from "./use-cookie-settings";

/**
 * Footer control that reopens the cookie settings dialog via the shared
 * `?cookie-settings=true` query state.
 */
export const CookieSettingsTrigger = () => {
  const t = useTranslations("footer");
  const { open } = useCookieSettings();

  return (
    <button type="button" className="hover:underline" onClick={open}>
      {t("cookie-settings")}
    </button>
  );
};
