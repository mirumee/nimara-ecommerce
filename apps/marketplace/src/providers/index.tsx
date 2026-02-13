"use client";

import type { ReactNode } from "react";

import { AppBridgeProvider } from "@saleor/app-sdk/app-bridge";

import { AuthProvider } from "./auth-provider";

interface ProvidersProps {
  children: ReactNode;
}

function shouldEnableAppBridge(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);

  // Saleor App Bridge requires at least one of these params in iframe URL.
  // In standalone mode (direct browser tab), they are typically missing.
  return Boolean(params.get("saleorApiUrl") || params.get("domain"));
}

export function Providers({ children }: ProvidersProps) {
  if (!shouldEnableAppBridge()) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <AppBridgeProvider>
      <AuthProvider>{children}</AuthProvider>
    </AppBridgeProvider>
  );
}
