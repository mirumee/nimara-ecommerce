import { type ReactNode, useEffect, useMemo } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@nimara/ui/components/alert";

import { saleorDomainFromApiUrl } from "@/lib/saleor/url";

import { Spinner } from "../spinner";
import { DashboardSessionContext } from "./context";
import { useBridgeState } from "./use-bridge-state";
import { useHandshakeTimeout } from "./use-handshake-timeout";

export const AppBridgeSession = ({ children }: { children: ReactNode }) => {
  const appBridgeState = useBridgeState();
  const isReady = !!appBridgeState?.ready;
  const hasTimedOut = useHandshakeTimeout(isReady);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      appBridgeState?.theme === "dark",
    );
  }, [appBridgeState?.theme]);

  const session = useMemo(
    () =>
      appBridgeState?.token && appBridgeState.saleorApiUrl
        ? {
            accessToken: appBridgeState.token,
            saleorDomain: saleorDomainFromApiUrl(appBridgeState.saleorApiUrl),
          }
        : null,
    [appBridgeState?.token, appBridgeState?.saleorApiUrl],
  );

  if (!isReady) {
    return hasTimedOut ? (
      <Alert variant="destructive">
        <AlertTitle>The Saleor Dashboard did not respond</AlertTitle>
        <AlertDescription>
          The app opened but never completed its handshake with the Dashboard.
          Open it from the Dashboard&apos;s app list rather than by URL, and
          check that this app&apos;s <code>appUrl</code> in the manifest matches
          where it is actually served.
        </AlertDescription>
      </Alert>
    ) : (
      <Spinner />
    );
  }

  if (!session) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Incomplete Dashboard session</AlertTitle>
        <AlertDescription>
          The Dashboard opened this app without a{" "}
          <code>{appBridgeState.saleorApiUrl ? "token" : "saleorApiUrl"}</code>,
          so it cannot call the Saleor API. Reopen the app from the
          Dashboard&apos;s app list.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <DashboardSessionContext.Provider value={session}>
      {children}
    </DashboardSessionContext.Provider>
  );
};
