import * as jose from "jose";

/**
 * Extract Saleor domain from a user's JWT token.
 * Falls back to NEXT_PUBLIC_SALEOR_URL environment variable if extraction fails.
 */
export function getSaleorDomainFromToken(token: string): string | null {
  try {
    const decoded = jose.decodeJwt(token) as { iss?: string };

    if (decoded.iss) {
      return new URL(decoded.iss).hostname;
    }
  } catch {
    // Ignore decoding errors
  }

  // Fallback to env
  const url = process.env.NEXT_PUBLIC_SALEOR_URL;

  if (url) {
    try {
      return new URL(url).hostname;
    } catch {
      // Ignore
    }
  }

  return null;
}

/**
 * Get Saleor's direct GraphQL endpoint for a given domain.
 */
export function getSaleorGraphQLEndpoint(saleorDomain: string): string {
  return `https://${saleorDomain}/graphql/`;
}
