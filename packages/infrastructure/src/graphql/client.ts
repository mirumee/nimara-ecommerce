import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

import {
  type AsyncResult,
  type Err,
  err,
  ok,
} from "@nimara/domain/objects/Result";

import { type Exact } from "#root/lib/types";
import { logger } from "#root/logging/service";

type AnyVariables = Record<string, unknown>;
type GraphqlError = {
  extensions: { exception: { code: string } };
  locations: Array<{ column: number; line: number }>;
  message: string;
  path: string[];
};
type GraphQLResponse<TData = any> = {
  data?: TData;
  errors?: Array<GraphqlError>;
  extensions: {
    cost?: { maximumAvailable: number; requestedQueryCost: number };
    exception?: object;
  };
};

type NextFetchOptions = { next?: { revalidate?: number; tags?: string[] } };

export type FetchOptions = Omit<RequestInit, "method" | "body"> &
  NextFetchOptions;

/**
 * @deprecated This client will be deprecated in the future. Once the new client is stable, this will be removed.
 * Use `graphqlClientV2` instead.
 */
export const graphqlClient = (
  url: RequestInfo | URL,
  accessToken?: string | null,
) => ({
  execute: async <
    TResult = any,
    TVariables extends AnyVariables = AnyVariables,
  >(
    query: DocumentTypeDecoration<TResult, TVariables> & { toString(): string },
    input?: {
      options?: FetchOptions;
      variables?: Exact<TVariables>;
    },
  ) => {
    const { variables, options } = input ?? {};
    const requestInit: RequestInit = {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({
        query: query.toString(),
        ...(variables && { variables }),
      }),
    };

    try {
      const response = await fetch(url, requestInit);

      if (!response.ok) {
        logger.error("Calling GraphQL API failed", {
          error: response.statusText,
        });

        return {
          error: { status: response.status, message: response.statusText },
        };
      }

      const body = (await response.json()) as GraphQLResponse<TResult>;

      if ("errors" in body) {
        logger.error("GraphQL error", { error: body["errors"] });

        return { error: body["errors"] };
      }

      return { data: body.data };
    } catch (e) {
      logger.error("Unexpected network error", {
        error: e,
        url,
      });

      return { error: e };
    }
  },
});

/**
 * A V2 of the graphqlClient. The main difference is how it is typed and what it returns.
 *
 * It accepts a required `operationName` property in `input` object, for logging purposes it is required as it cannot be derived from query.
 *
 * @example
 * const result = await graphqlClientV2.execute(OrdersGetQuery);
 *
 * if (!result.ok) {
 *    // Handle server errors
 *    return
 * }
 *
 * // At this point we know that result is ok and we can safely access data
 * const { data } = result
 **/
export const graphqlClientV2 = (
  url: RequestInfo | URL,
  accessToken?: string | null,
) => ({
  execute: async <
    TResult = any,
    TVariables extends AnyVariables = AnyVariables,
  >(
    query: DocumentTypeDecoration<TResult, TVariables> & { toString(): string },
    input: {
      operationName: `${string}${"Mutation" | "Query"}`;
      options?: FetchOptions;
      variables?: TVariables;
    },
  ): AsyncResult<TResult> => {
    const { variables, options, operationName } = input;

    try {
      const response = await fetch(url, {
        ...options,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          query: query.toString(),
          ...(variables && { variables }),
        }),
      });

      if (!response.ok) {
        return handleInvalidResponse(response, { operationName });
      }

      const body = (await response.json()) as GraphQLResponse<TResult>;

      if ("errors" in body) {
        const exceptionCode = body?.errors?.[0].extensions.exception.code;

        logger.error("GraphQL error", {
          error: body["errors"],
          operationName,
          exceptionCode,
        });

        return err({
          code: "HTTP_ERROR",
          message: "GraphQL Error",
        });
      }

      if (!body.data) {
        return err({
          code: "HTTP_ERROR",
          message: "No data returned from GraphQL",
        });
      }

      return ok(body.data);
    } catch (e) {
      logger.error("Unexpected HTTP error", {
        error: e,
        operationName,
      });

      return err({
        code: "UNEXPECTED_HTTP_ERROR",
        message: "Unexpected HTTP error",
      });
    }
  },
});

const handleInvalidResponse = (
  response: Response,
  { operationName }: { operationName: string },
): Err => {
  // Add more cases for response.status if needed.
  switch (response.status) {
    case 404:
      logger.error("Not found", {
        message: response.statusText,
        status: response.status,
        operationName,
      });

      return err({
        code: "NOT_FOUND_ERROR",
        status: response.status,
        message: response.statusText,
      });

    case 429:
      logger.error("Too many requests", {
        message: response.statusText,
        status: response.status,
        operationName,
      });

      return err({
        code: "TOO_MANY_REQUESTS",
        status: response.status,
        message: response.statusText,
      });

    default:
      logger.error("API request failed", {
        message: response.statusText,
        status: response.status,
        operationName,
      });

      return err({
        code: "HTTP_ERROR",
        status: response.status,
        message: response.statusText,
      });
  }
};
