import { isLocalDomain } from "#root/utils/url";

// Saleor's origin for a domain (host). Local domains use http, the rest https.
export const saleorUrlFromDomain = (saleorDomain: string) =>
  isLocalDomain(`http://${saleorDomain}`)
    ? `http://${saleorDomain}`
    : `https://${saleorDomain}`;

export const saleorDomainFromApiUrl = (saleorApiUrl: string) =>
  new URL(saleorApiUrl).host;
