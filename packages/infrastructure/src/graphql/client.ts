import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

import type { Err, Result } from "@nimara/domain/objects/Error";

import { loggingService } from "#root/logging/service";

type AnyVariables = Record<string, any> | undefined;
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
      variables?: TVariables;
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
        loggingService.error("Calling GraphQL API failed", {
          error: response.statusText,
        });

        return {
          error: { status: response.status, message: response.statusText },
        };
      }

      const body = (await response.json()) as GraphQLResponse<TResult>;

      if ("errors" in body) {
        loggingService.error("GraphQL error", { error: body["errors"] });

        return { error: body["errors"] };
      }

      return { data: body.data };
    } catch (e) {
      loggingService.error("Unexpected network error", {
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
 * ```typescript
 * const { data, error } = await graphqlClientV2.execute(OrdersGetQuery);
 *
 * if (error) {
 *    // handle server errors
 *    return
 * }
 *
 * const data = data.ordersGet
 * // Handle data, check for errors etc.
 *
 * ```
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
      operationName: string;
      options?: FetchOptions;
      variables?: TVariables;
    },
  ): Promise<Result<TResult>> => {
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

        loggingService.error("GraphQL error", {
          error: body["errors"],
          operationName,
          exceptionCode,
        });

        return {
          data: null,
          error: {
            code: "INPUT_ERROR",
            message: "GraphQL Error",
          },
        };
      }

      return { data: body.data as TResult, error: null };
    } catch (e) {
      loggingService.error("Unexpected HTTP error", {
        error: e,
        operationName,
      });

      return {
        data: null,
        error: {
          code: "UNEXPECTED_HTTP_ERROR",
          message: "Unexpected HTTP error",
        },
      };
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
      loggingService.error("Not found", {
        message: response.statusText,
        status: response.status,
        operationName,
      });

      return {
        data: null,
        error: {
          code: "NOT_FOUND_ERROR",
          status: response.status,
          message: response.statusText,
        },
      };

    case 429:
      loggingService.error("Too many requests", {
        message: response.statusText,
        status: response.status,
        operationName,
      });

      return {
        data: null,
        error: {
          code: "TOO_MANY_REQUESTS",
          status: response.status,
          message: response.statusText,
        },
      };

    default:
      loggingService.error("API request failed", {
        message: response.statusText,
        status: response.status,
        operationName,
      });

      return {
        data: null,
        error: {
          code: "HTTP_ERROR",
          status: response.status,
          message: response.statusText,
        },
      };
  }
};
