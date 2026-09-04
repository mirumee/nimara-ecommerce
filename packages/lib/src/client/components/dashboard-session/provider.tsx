import { AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { type ReactNode } from "react";

import { DashboardSessionContext } from "#root/client/dashboard-session/context";
import { readDevSession } from "#root/client/dev-session";

import { AppBridgeSession } from "./app-bridge-session";
import { StandaloneBanner } from "./standalone-banner";

// Credentials from the app bridge in the iframe, from env when standalone.
export const DashboardSessionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // A literal `false` in a production build, so this branch never ships.
  if (import.meta.env.DEV) {
    const devSession = readDevSession();

    if (devSession) {
      return (
        <DashboardSessionContext.Provider value={devSession}>
          <StandaloneBanner />
          {children}
        </DashboardSessionContext.Provider>
      );
    }
  }

  return (
    <AppBridgeProvider>
      <AppBridgeSession>{children}</AppBridgeSession>
    </AppBridgeProvider>
  );
};
