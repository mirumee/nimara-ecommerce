import { useEffect, useState } from "react";

const HANDSHAKE_TIMEOUT_MS = 10000;

export const useHandshakeTimeout = (isReady: boolean) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (isReady) {
      return;
    }

    const timeout = window.setTimeout(
      () => setHasTimedOut(true),
      HANDSHAKE_TIMEOUT_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [isReady]);

  return hasTimedOut;
};
