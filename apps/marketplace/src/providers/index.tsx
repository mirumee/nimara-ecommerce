"use client";

import { AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { type ReactNode, useState } from "react";

import { AuthProvider, AuthProviderWithAppBridge } from "./auth-provider";

interface ProvidersProps {
  children: ReactNode;
}

const APP_BRIDGE_SESSION_KEY = "marketplace_app_bridge_enabled";

function shouldEnableAppBridge(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  const hasAppBridgeParams = Boolean(
    params.get("saleorApiUrl") || params.get("domain"),
  );

  if (hasAppBridgeParams) {
    sessionStorage.setItem(APP_BRIDGE_SESSION_KEY, "1");

    return true;
  }

  return sessionStorage.getItem(APP_BRIDGE_SESSION_KEY) === "1";
}

export function Providers({ children }: ProvidersProps) {
  // Decide once per app load to avoid remounting providers between route changes.
  const [appBridgeEnabled] = useState(shouldEnableAppBridge);

  if (!appBridgeEnabled) {
    return <AuthProvider appBridgeState={null}>{children}</AuthProvider>;
  }

  return (
    <AppBridgeProvider>
      <AuthProviderWithAppBridge>{children}</AuthProviderWithAppBridge>
    </AppBridgeProvider>
  );
}
