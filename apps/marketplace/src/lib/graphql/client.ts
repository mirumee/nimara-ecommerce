import { graphqlClient as createGraphqlClient } from "@nimara/infrastructure/graphql/client";

const endpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3001/api/graphql";

/**
 * Get Saleor domain from env (hostname of NEXT_PUBLIC_SALEOR_URL).
 * Required by the marketplace GraphQL API for domain-only and authenticated operations.
 * Works on both client and server so server actions send the header too.
 */
export function getSaleorDomainHeader(): Record<string, string> {
  const url = process.env.NEXT_PUBLIC_SALEOR_URL;

  if (!url) {
    return {};
  }
  try {
    const domain = new URL(url).hostname;

    return { "x-saleor-domain": domain };
  } catch {
    return {};
  }
}

/**
 * Client for making GraphQL requests with optional authentication.
 * Uses the infrastructure's graphqlClient which returns AsyncResult (ok/err pattern).
 *
 * Note: This adds the x-saleor-domain header for marketplace-specific needs.
 *
 * @param token - Optional access token for authenticated requests
 * @returns GraphQL client with execute method
 */
export const graphqlClient = (token?: string | null) => {
  const client = createGraphqlClient(endpoint, token);

  // Wrap execute to add x-saleor-domain header (client-side only)
  const originalExecute = client.execute;

  return {
    execute: <TResult, TVariables extends Record<string, unknown>>(
      ...args: Parameters<typeof originalExecute<TResult, TVariables>>
    ) => {
      const [query, input] = args;
      const saleorDomainHeader = getSaleorDomainHeader();

      return originalExecute(query, {
        ...input,
        options: {
          ...input.options,
          headers: {
            ...saleorDomainHeader,
            ...input.options?.headers,
          },
        },
      });
    },
  };
};

/**
 * Get the current access token from localStorage (client-side only).
 * For server-side, use getServerAuthToken() from @/lib/auth/server instead.
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("auth_token");
}
