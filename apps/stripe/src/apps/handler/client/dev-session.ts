import { saleorDomainFromApiUrl } from "@/lib/saleor/url";
import { invariant } from "@/lib/util";

/**
 * Renders the config UI outside the Dashboard iframe.
 * Both reads sit behind `import.meta.env.DEV`, so a production bundle carries no token.
 */
export const readDevSession = () => {
  const isInDashboard = window.self !== window.top;

  if (!import.meta.env.DEV || isInDashboard) {
    return null;
  }

  const saleorApiUrl = import.meta.env.VITE_SALEOR_API_URL;
  const accessToken = import.meta.env.VITE_SALEOR_APP_TOKEN;

  if (!saleorApiUrl && !accessToken) {
    return null;
  }

  // Half a session is a silent spinner otherwise — say which half is missing.
  invariant(
    saleorApiUrl,
    "VITE_SALEOR_API_URL must be set to run the config UI outside the Saleor Dashboard.",
  );
  invariant(
    accessToken,
    "VITE_SALEOR_APP_TOKEN must be set to run the config UI outside the Saleor Dashboard.",
  );

  return { accessToken, saleorDomain: saleorDomainFromApiUrl(saleorApiUrl) };
};
