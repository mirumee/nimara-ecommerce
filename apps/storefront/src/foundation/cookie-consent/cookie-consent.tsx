"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { type ConsentCategories, setConsentAction } from "@/foundation/consent";
import { createTrackingServiceLoader } from "@/services/lazy-loaders/tracking";

import { CookieBanner } from "./cookie-banner";
import { CookieSettings } from "./cookie-settings";
import { useCookieSettings } from "./use-cookie-settings";

const trackingServiceLoader = createTrackingServiceLoader();

type Props = {
  initialCategories: ConsentCategories;
  isConsentAccepted: boolean;
};

export const CookieConsent = ({
  initialCategories,
  isConsentAccepted,
}: Props) => {
  const router = useRouter();
  const {
    close: closeSettings,
    isOpen: settingsOpen,
    open: openSettings,
  } = useCookieSettings();
  const [categories, setCategories] =
    useState<ConsentCategories>(initialCategories);
  const [dismissed, setDismissed] = useState(false);
  const [, startTransition] = useTransition();

  const persist = (next: ConsentCategories) => {
    setDismissed(true);
    closeSettings();
    startTransition(async () => {
      await setConsentAction(next);

      const tracking = await trackingServiceLoader();

      await tracking.updateConsent({
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

  return <CookieBanner onOpenSettings={openSettings} persist={persist} />;
};
