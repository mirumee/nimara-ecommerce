import { AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { type ReactNode } from "react";

import { readDevSession } from "@/apps/handler/client/dev-session";

import { AppBridgeSession } from "./app-bridge-session";
import { DashboardSessionContext } from "./context";
import { StandaloneBanner } from "./standalone-banner";

/**
 * Saleor credentials from the app bridge in the iframe, from the environment
 * when developing standalone.
 */
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
