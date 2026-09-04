import { type AppBridgeState, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useEffect, useState } from "react";

const HANDSHAKE_POLL_MS = 200;

/**
 * The bridge posts `notifyReady` before `useAppBridge` subscribes; a handshake
 * landing in that gap strands the app on a spinner, so poll until it is ready.
 */
export const useBridgeState = () => {
  const { appBridge, appBridgeState } = useAppBridge();
  const [polledState, setPolledState] = useState<AppBridgeState | null>(null);
  const state = appBridgeState?.ready ? appBridgeState : polledState;

  useEffect(() => {
    if (!appBridge || state?.ready) {
      return;
    }

    const interval = window.setInterval(() => {
      const current = appBridge.getState();

      if (current.ready) {
        setPolledState(current);
      }
    }, HANDSHAKE_POLL_MS);

    return () => window.clearInterval(interval);
  }, [appBridge, state?.ready]);

  return state;
};
