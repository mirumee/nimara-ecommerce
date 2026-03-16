"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@nimara/ui/components/button";

import {
  createStripeConnectOnboardingSession,
  syncStripeConnectStatus,
} from "@/app/(authenticated)/_actions/stripe-connect";
import { useAuth } from "@/providers/auth-provider";

export function StripeConnectGate() {
  const t = useTranslations("marketplace.stripeConnect");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshVendorStripeState } = useAuth();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAutoSynced = useRef(false);

  const handleSetup = async () => {
    setError(null);
    setIsSettingUp(true);

    try {
      const result = await createStripeConnectOnboardingSession();

      if (!result.ok) {
        setError(result.error);

        return;
      }

      window.location.assign(result.url);
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSync = async () => {
    setError(null);
    setIsSyncing(true);

    try {
      const result = await syncStripeConnectStatus();

      if (!result.ok) {
        setError(result.error);

        return;
      }

      await refreshVendorStripeState();
      router.replace("/dashboard");
      router.refresh();
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const stripeState = searchParams.get("stripe");

    if (!stripeState || hasAutoSynced.current) {
      return;
    }

    if (stripeState === "return") {
      hasAutoSynced.current = true;
      void handleSync();
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-xl space-y-6 rounded-xl border bg-background p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSetup} disabled={isSettingUp || isSyncing}>
            {isSettingUp ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("redirecting")}
              </span>
            ) : (
              t("setup-button")
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={isSettingUp || isSyncing}
          >
            {isSyncing ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("checking")}
              </span>
            ) : (
              t("completed-setup-button")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
