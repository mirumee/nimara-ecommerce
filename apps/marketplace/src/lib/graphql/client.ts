import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
import * as jose from "jose";

import {
  type FetchOptions,
  graphqlClient as createGraphqlClient,
} from "@nimara/infrastructure/graphql/client";

import { config } from "@/lib/config";
import { getAppBridgeDomain } from "@/lib/saleor/app-bridge-domain";
import type { SaleorJWTPayload } from "@/lib/saleor/types";

type AnyVariables = Record<string, unknown>;
type GraphqlInput<TVariables extends AnyVariables> = {
  operationName: `${string}${"Mutation" | "Query"}`;
  options?: FetchOptions;
  variables?: TVariables;
};

function normalizeUrl(input: string): string | null {
  const value = input.trim();

  if (!value) {
    return null;
  }

  const withProtocol =
    value.startsWith("http://") || value.startsWith("https://")
      ? value
      : `https://${value}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function getServerOrigin(): string {
  return config.urls.vendor.replace(/\/$/, "");
}

/** GraphQL endpoint – use current origin on client (avoids CORS when accessed via ngrok, etc.) */
function getGraphQLEndpoint(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/graphql`;
  }

  const configuredEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim();

  if (configuredEndpoint) {
    if (
      configuredEndpoint.startsWith("http://") ||
      configuredEndpoint.startsWith("https://")
    ) {
      return configuredEndpoint;
    }

    if (configuredEndpoint.startsWith("/")) {
      return `${getServerOrigin()}${configuredEndpoint}`;
    }

    const normalized = normalizeUrl(configuredEndpoint);

    if (normalized) {
      return normalized;
    }
  }

  return `${getServerOrigin()}/api/graphql`;
}

/**
 * Get Saleor domain for the x-saleor-domain header.
 * Prefers App Bridge domain (when app is opened from Saleor Cloud dashboard),
 * falls back to env (NEXT_PUBLIC_SALEOR_URL), then to JWT issuer (server-side only).
 *
 * @param token - Optional JWT for server-side fallback when env is not set
 */
export function getSaleorDomainHeader(
  token?: string | null,
): Record<string, string> {
  const appBridge = getAppBridgeDomain();

  if (appBridge) {
    return { "x-saleor-domain": appBridge };
  }

  const url = process.env.NEXT_PUBLIC_SALEOR_URL;

  if (url) {
    try {
      const domain = new URL(url).hostname;

      return { "x-saleor-domain": domain };
    } catch {
      // fall through to JWT
    }
  }

  // Server-side fallback: extract domain from JWT issuer (e.g. Saleor Cloud)
  if (typeof window === "undefined" && token) {
    try {
      const decoded = jose.decodeJwt(token) as SaleorJWTPayload;

      if (decoded.iss) {
        const domain = new URL(decoded.iss).host;

        return { "x-saleor-domain": domain };
      }
    } catch {
      // Ignore
    }
  }

  return {};
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
      const saleorDomainHeader = getSaleorDomainHeader(token);

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
