"use client";

import { AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import type { ReactNode } from "react";

import { AuthProvider, AuthProviderWithAppBridge } from "./auth-provider";

interface ProvidersProps {
  children: ReactNode;
}

function shouldEnableAppBridge(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const params = new URLSearchParams(window.location.search);

  return Boolean(params.get("saleorApiUrl") || params.get("domain"));
}

export function Providers({ children }: ProvidersProps) {
  if (!shouldEnableAppBridge()) {
    return <AuthProvider appBridgeState={null}>{children}</AuthProvider>;
  }

  return (
    <AppBridgeProvider>
      <AuthProviderWithAppBridge>{children}</AuthProviderWithAppBridge>
    </AppBridgeProvider>
  );
}
