import { GraphQLClient } from "graphql-request";

const endpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3001/api/graphql";

/**
 * Get Saleor domain from env (hostname of NEXT_PUBLIC_SALEOR_URL).
 * Required by the marketplace GraphQL API for domain-only and authenticated operations.
 */
export function getSaleorDomainHeader(): Record<string, string> {
  if (typeof window === "undefined") {return {};}
  const url = process.env.NEXT_PUBLIC_SALEOR_URL;

  if (!url) {return {};}
  try {
    const domain = new URL(url).hostname;


return { "x-saleor-domain": domain };
  } catch {
    return {};
  }
}

export function getGraphQLClient(token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getSaleorDomainHeader(),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return new GraphQLClient(endpoint, { headers });
}

// Fetcher for client-side GraphQL requests (e.g. used by useGraphQLQuery)
export function graphqlFetcher<TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit | HeadersInit,
): () => Promise<TData> {
  return async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const requestInit: RequestInit =
      options && typeof options === "object" && "method" in options
        ? (options as RequestInit)
        : {};

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...getSaleorDomainHeader(),
      ...(requestInit.headers &&
      typeof requestInit.headers === "object" &&
      !(requestInit.headers instanceof Headers)
        ? (requestInit.headers as Record<string, string>)
        : {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
      ...requestInit,
    });

    const json = await response.json();

    if (json.errors) {
      const first = json.errors[0];
      const message =
        first?.message != null ? String(first.message) : "Error fetching GraphQL data";

      throw new Error(message);
    }

    return json.data;
  };
}

// Server-side fetcher for use in Server Components
export async function serverGraphqlFetcher<TData, TVariables>(
  query: string,
  variables?: TVariables,
  token?: string,
): Promise<TData> {
  const saleorUrl = process.env.NEXT_PUBLIC_SALEOR_URL;

  if (!saleorUrl) {
    throw new Error("NEXT_PUBLIC_SALEOR_URL is not defined");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(saleorUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: "no-store",
  });

  const json = await response.json();

  if (json.errors) {
    const first = json.errors[0];
    const message =
      first?.message != null ? String(first.message) : "Error fetching GraphQL data";

    throw new Error(message);
  }

  return json.data;
}
