"use client";

import { useTranslations } from "next-intl";
import { parseAsBoolean, useQueryState } from "nuqs";

import { COOKIE_SETTINGS_QUERY_KEY } from "./cookie-consent";

/**
 * Footer control that reopens the cookie settings dialog by toggling the
 * `?cookie-settings=true` query state the {@link CookieConsent} reads.
 */
export const CookieSettingsTrigger = () => {
  const t = useTranslations("footer");
  const [, setSettingsOpen] = useQueryState(
    COOKIE_SETTINGS_QUERY_KEY,
    parseAsBoolean.withDefault(false),
  );

  return (
    <button
      type="button"
      className="hover:underline"
      onClick={() => void setSettingsOpen(true)}
    >
      {t("cookie-settings")}
    </button>
  );
};
