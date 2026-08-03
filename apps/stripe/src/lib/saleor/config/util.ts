const LOCAL_HOSTS = ["localhost", "127.0.0.1"];

export const getSaleorDomainFromApiUrl = (saleorApiUrl: string) =>
  new URL(saleorApiUrl).host;

/**
 * Requests carry the tenant as a domain, not a url, and everything fetched for
 * that tenant is addressed from it, so a caller cannot point this deployment at
 * a server of its own. A local Saleor is served over http, every hosted one
 * over https.
 */
export const getSaleorUrlFromDomain = (saleorDomain: string) => {
  const isLocal = LOCAL_HOSTS.includes(saleorDomain.split(":")[0]);

  return `${isLocal ? "http" : "https"}://${saleorDomain}`;
};

/**
 * Patterns may use `*` as a wildcard, so a whole Saleor cloud subdomain space
 * can be allowed with a single entry.
 */
export const isDomainAllowed = ({
  domain,
  allowedDomains,
}: {
  allowedDomains: string[];
  domain: string;
}) => {
  if (!domain || !allowedDomains.length) {
    return false;
  }

  const normalizedDomain = domain.toLowerCase();

  return allowedDomains.some((pattern) => {
    const normalizedPattern = pattern.toLowerCase();

    if (normalizedPattern === normalizedDomain) {
      return true;
    }

    if (normalizedPattern.includes("*")) {
      const expression = normalizedPattern
        .replace(/\./g, "\\.")
        .replace(/\*/g, ".*");

      return new RegExp(`^${expression}$`).test(normalizedDomain);
    }

    return false;
  });
};
