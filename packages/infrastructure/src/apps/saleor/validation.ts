/**
 * Whether a Saleor domain is allowed to install / call the app. Supports exact
 * matches and `*` wildcards (`*.eu.saleor.cloud`, or `*` for any).
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
