"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { Button } from "@nimara/ui/components/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">
        {t("marketplace.pages.error-title")}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {t("marketplace.pages.error-description")}
      </p>
      <Button onClick={() => reset()} className="mt-6">
        {t("marketplace.pages.error-try-again")}
      </Button>
    </div>
  );
}
