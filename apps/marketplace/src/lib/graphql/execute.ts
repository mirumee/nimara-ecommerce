import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

import type { AsyncResult } from "@nimara/domain/objects/Result";

import { getAccessToken, graphqlClient } from "./client";

type GraphQLVariables = Record<string, unknown>;

type ExecuteOptions = {
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
};

/**
 * Execute a GraphQL query or mutation with automatic token handling.
 * Works on both client (localStorage) and server (pass token explicitly).
 *
 * @param document - GraphQL document from codegen
 * @param operationName - Name of the operation (e.g., "OrdersQuery")
 * @param variables - Variables for the operation
 * @param token - Optional token (for server-side). If not provided, will use localStorage (client-side)
 * @param options - Fetch options (cache, revalidate, tags)
 */
export async function executeGraphQL<
  TResult,
  TVariables extends GraphQLVariables,
>(
  document: DocumentTypeDecoration<TResult, TVariables> & {
    toString(): string;
  },
  operationName: `${string}${"Query" | "Mutation"}`,
  variables?: TVariables,
  token?: string | null,
  options?: ExecuteOptions,
): AsyncResult<TResult> {
  const authToken = token ?? getAccessToken();
  const client = graphqlClient(authToken);

  return client.execute<TResult, TVariables>(document, {
    operationName,
    variables,
    options: {
      cache: options?.cache ?? "no-store",
      ...(options?.revalidate && { next: { revalidate: options.revalidate } }),
      ...(options?.tags && { next: { tags: options.tags } }),
    },
  });
}
