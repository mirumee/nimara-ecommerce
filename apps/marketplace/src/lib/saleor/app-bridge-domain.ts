/**
 * When the app is opened from Saleor Cloud dashboard, the App Bridge provides
 * saleorApiUrl. We store the extracted domain here so the GraphQL client can
 * use it for the x-saleor-domain header (instead of env).
 *
 * Also supports saleorApiUrl from URL query params (e.g. NEW_TAB extension with GET).
 */
let appBridgeDomain: string | null = null;

export function setAppBridgeDomain(saleorApiUrl: string | undefined): void {
  if (!saleorApiUrl) {
    appBridgeDomain = null;

    return;
  }
  try {
    appBridgeDomain = new URL(saleorApiUrl).hostname;
  } catch {
    appBridgeDomain = null;
  }
}

export function getAppBridgeDomain(): string | null {
  return appBridgeDomain;
}

/** Parse saleorApiUrl from URL and set domain. Returns true if found. */
export function initDomainFromUrl(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const saleorApiUrl = new URLSearchParams(window.location.search).get(
    "saleorApiUrl",
  );

  if (saleorApiUrl) {
    setAppBridgeDomain(saleorApiUrl);

    return true;
  }

  return false;
}
