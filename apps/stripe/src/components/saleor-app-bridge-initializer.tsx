"use client";

import { AppBridgeProvider, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { type ReactNode } from "react";

import { Spinner } from "@/components/spinner";

export const SaleorAppBridgeInitializer = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <AppBridgeProvider>
      <AppBridgeReady>{children}</AppBridgeReady>
    </AppBridgeProvider>
  );
};

const AppBridgeReady = ({ children }: { children: ReactNode }) => {
  const { appBridgeState } = useAppBridge();

  if (!appBridgeState?.ready) {
    return <Spinner />;
  }

  return children;
};
