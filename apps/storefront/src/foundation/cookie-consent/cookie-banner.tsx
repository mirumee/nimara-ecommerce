"use client";

import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { LocalizedLink } from "@nimara/i18n/routing";
import { Button } from "@nimara/ui/components/button";

import {
  ACCEPT_ALL_CONSENT,
  type ConsentCategories,
  REJECT_ALL_CONSENT,
} from "@/foundation/consent";
import { paths } from "@/foundation/routing/paths";

export const CookieBanner = ({
  onOpenSettings,
  persist,
}: {
  onOpenSettings: () => void;
  persist: (next: ConsentCategories) => void;
}) => {
  const t = useTranslations("cookie-consent");

  return (
    <div
      role="region"
      aria-label={t("aria-label")}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center sm:bottom-6 sm:px-6"
    >
      <div className="pointer-events-auto w-full border-t bg-background shadow-lg duration-300 animate-in fade-in slide-in-from-bottom-8 sm:w-auto sm:max-w-2xl sm:rounded-lg sm:border">
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-semibold leading-6 tracking-tight text-primary">
              {t("title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t.rich("description", {
                termsLink: (chunks: ReactNode) => (
                  <LocalizedLink
                    href={paths.termsOfUse.asPath()}
                    className="underline decoration-gray-400 underline-offset-2"
                  >
                    {chunks}
                  </LocalizedLink>
                ),
                privacyLink: (chunks: ReactNode) => (
                  <LocalizedLink
                    href={paths.privacyPolicy.asPath()}
                    className="underline decoration-gray-400 underline-offset-2"
                  >
                    {chunks}
                  </LocalizedLink>
                ),
              })}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button
              variant="outline"
              onClick={() => persist(REJECT_ALL_CONSENT)}
            >
              {t("reject-all")}
            </Button>
            <Button variant="outline" onClick={onOpenSettings}>
              {t("settings")}
            </Button>
            <Button onClick={() => persist(ACCEPT_ALL_CONSENT)}>
              {t("accept-all")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
