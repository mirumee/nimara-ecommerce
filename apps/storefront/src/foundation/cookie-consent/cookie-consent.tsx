"use client";

import { useRouter } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect, useState, useTransition } from "react";

import { type ConsentCategories, setConsentAction } from "@/foundation/consent";
import { getTrackingService } from "@/services/tracking";

import { CookieBanner } from "./cookie-banner";
import { CookieSettings } from "./cookie-settings";

export const COOKIE_SETTINGS_QUERY_KEY = "cookie-settings";

type Props = {
  initialCategories: ConsentCategories;
  isConsentAccepted: boolean;
};

export const CookieConsent = ({
  initialCategories,
  isConsentAccepted,
}: Props) => {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useQueryState(
    COOKIE_SETTINGS_QUERY_KEY,
    parseAsBoolean.withDefault(false),
  );
  const [categories, setCategories] =
    useState<ConsentCategories>(initialCategories);
  const [dismissed, setDismissed] = useState(false);
  const [, startTransition] = useTransition();

  const closeSettings = () => {
    void setSettingsOpen(null);
  };

  const persist = (next: ConsentCategories) => {
    setDismissed(true);
    closeSettings();
    startTransition(async () => {
      await setConsentAction(next);
      await getTrackingService().updateConsent({
        ...next,
        necessary: true,
      });
      router.refresh();
    });
  };

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  if (settingsOpen) {
    return (
      <CookieSettings
        categories={categories}
        onClose={closeSettings}
        persist={persist}
        setCategories={setCategories}
      />
    );
  }

  if (isConsentAccepted || dismissed) {
    return null;
  }

  return (
    <CookieBanner
      onOpenSettings={() => void setSettingsOpen(true)}
      persist={persist}
    />
  );
};
