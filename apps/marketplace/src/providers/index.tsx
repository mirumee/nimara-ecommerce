"use client";

import type { ReactNode } from "react";

import { AppBridgeProvider } from "@saleor/app-sdk/app-bridge";

import { AuthProvider } from "./auth-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AppBridgeProvider>
      <AuthProvider>{children}</AuthProvider>
    </AppBridgeProvider>
  );
}
