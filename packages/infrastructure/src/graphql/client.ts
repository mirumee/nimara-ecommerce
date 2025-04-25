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
 * It accepts a required `operationName` property in `input` object, for logging purposes it is required as it cannot be derived from query.
 *
 * @example
 * const result = await graphqlClient.execute(OrdersGetQuery);
 *
 * if (!result.ok) {
 *    // Handle server errors
 *    return
 * }
 *
 * // At this point we know that result is ok and we can safely access data
 * const { data } = result
 **/
export const graphqlClient = (
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
      variables?: Exact<TVariables>;
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
        return handleInvalidResponse({ response, operationName, url });
      }

      const body = (await response.json()) as GraphQLResponse<TResult>;

      if ("errors" in body) {
        const exceptionCode = body?.errors?.[0].extensions.exception.code;

        logger.error("GraphQL Error", {
          error: body["errors"],
          operationName,
          exceptionCode,
          variables,
          url,
        });

        return err([
          {
            code: "HTTP_ERROR",
            message: "GraphQL Error",
          },
        ]);
      }

      if (!body.data) {
        logger.error("HTTP Error", {
          error: body["errors"],
          operationName,
          variables,
          url,
        });

        return err([
          {
            code: "HTTP_ERROR",
            message: "No data returned from GraphQL",
          },
        ]);
      }

      return ok(body.data);
    } catch (e) {
      logger.error("Unexpected HTTP error", {
        error: e,
        operationName,
        url,
        variables,
      });

      return err([
        {
          code: "UNEXPECTED_HTTP_ERROR",
          message: "Unexpected HTTP error",
        },
      ]);
    }
  },
});

const handleInvalidResponse = ({
  operationName,
  response,
  url,
}: {
  operationName: string;
  response: Response;
  url: RequestInfo | URL;
}): Err => {
  // Add more cases for response.status if needed.
  switch (response.status) {
    case 404:
      logger.error("Not found", {
        message: response.statusText,
        status: response.status,
        operationName,
        url,
      });

      return err([
        {
          code: "NOT_FOUND_ERROR",
          status: response.status,
          message: response.statusText,
          context: {
            operationName,
            url,
          },
        },
      ]);

    case 429:
      logger.error("Too many requests", {
        message: response.statusText,
        status: response.status,
        operationName,
        url,
      });

      return err([
        {
          code: "TOO_MANY_REQUESTS_ERROR",
          status: response.status,
          message: response.statusText,
          context: {
            operationName,
            url,
          },
        },
      ]);

    default:
      logger.error("API request failed", {
        message: response.statusText,
        status: response.status,
        operationName,
        url,
      });

      return err([
        {
          code: "HTTP_ERROR",
          status: response.status,
          message: response.statusText,
          context: {
            operationName,
            url,
          },
        },
      ]);
  }
};
