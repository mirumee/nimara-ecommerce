/**
 * Exact matches and `*` wildcards (`*.eu.saleor.cloud`, `*` for any). An empty
 * allow list allows nothing.
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
      const regex = normalizedPattern
        .replace(/\./g, "\\.")
        .replace(/\*/g, ".*");

      return new RegExp(`^${regex}$`).test(normalizedDomain);
    }

    return false;
  });
};

export const rejectedDomainMessage = ({
  allowedDomains,
  saleorDomain,
}: {
  allowedDomains: string[];
  saleorDomain?: string;
}) =>
  allowedDomains.length
    ? `${saleorDomain ?? "The request"} is not an allowed Saleor domain.`
    : "No Saleor domain is allowed. Set ALLOWED_DOMAINS to the domains this deployment serves.";
