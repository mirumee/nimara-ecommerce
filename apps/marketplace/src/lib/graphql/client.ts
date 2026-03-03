import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

import {
  type FetchOptions,
  graphqlClient as createGraphqlClient,
} from "@nimara/infrastructure/graphql/client";

import { getAppBridgeDomain } from "@/lib/saleor/app-bridge-domain";

type AnyVariables = Record<string, unknown>;
type GraphqlInput<TVariables extends AnyVariables> = {
  operationName: `${string}${"Mutation" | "Query"}`;
  options?: FetchOptions;
  variables?: TVariables;
};

/** GraphQL endpoint – use current origin on client (avoids CORS when accessed via ngrok, etc.) */
function getGraphQLEndpoint(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/graphql`;
  }

  return (
    process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3001/api/graphql"
  );
}

/**
 * Get Saleor domain for the x-saleor-domain header.
 * Prefers App Bridge domain (when app is opened from Saleor Cloud dashboard),
 * falls back to env (NEXT_PUBLIC_SALEOR_URL).
 */
export function getSaleorDomainHeader(): Record<string, string> {
  const appBridge = getAppBridgeDomain();

  if (appBridge) {
    return { "x-saleor-domain": appBridge };
  }

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
  const client = createGraphqlClient(getGraphQLEndpoint(), token);

  // Wrap execute to add x-saleor-domain header (client-side only)
  const originalExecute = client.execute;

  return {
    execute: <TResult, TVariables extends AnyVariables = AnyVariables>(
      query: DocumentTypeDecoration<TResult, TVariables> & {
        toString(): string;
      },
      input: GraphqlInput<TVariables>,
    ) => {
      const saleorDomainHeader = getSaleorDomainHeader();

      return originalExecute<TResult, TVariables>(query, {
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
