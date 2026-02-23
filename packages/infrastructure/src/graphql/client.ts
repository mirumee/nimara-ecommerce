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
  extensions?: {
    code?: string;
    exception?: { code: string };
  };
  locations?: Array<{ column: number; line: number }>;
  message: string;
  path?: string[];
};
type GraphQLResponse<TData = any> = {
  data?: TData;
  errors?: Array<GraphqlError>;
  extensions: {
    cost?: { maximumAvailable: number; requestedQueryCost: number };
    exception?: object;
  };
};

/**
 * Options for Next.js fetch, allowing to specify revalidation and tags for caching.
 * @see https://nextjs.org/docs/app/building-your-application/data-fetching/fetching#nextfetchoptions
 * @param next - Next.js specific options for fetch.
 * @param revalidate - Time in seconds after which the data should be revalidated.
 * @param tags - Array of tags for cache invalidation.
 */
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
 *   // Handle server errors
 *   return
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
    const startTime = performance.now();
    const isCached = !!options?.next?.tags;

    if (!isCached && options?.cache !== "no-store") {
      logger.warning("GraphQL request without caching", {
        operationName,
        variables,
      });
    }

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

      const duration = Math.round(performance.now() - startTime);

      // Check if response has content before parsing
      const contentType = response.headers.get("content-type");
      const text = await response.text();

      if (!contentType?.includes("application/json")) {
        logger.error("Invalid content type", {
          durationMs: duration,
          contentType,
          status: response.status,
          statusText: response.statusText,
          bodyPreview: text.slice(0, 500),
          operationName,
          url,
        });

        return err([
          {
            code: "INVALID_RESPONSE_ERROR",
            message: `Invalid content type: ${contentType || "unknown"}`,
          },
        ]);
      }

      let body: GraphQLResponse<TResult>;

      try {
        body = JSON.parse(text) as GraphQLResponse<TResult>;
      } catch (parseError) {
        logger.error("Failed to parse JSON response", {
          durationMs: duration,
          parseError:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
          bodyPreview: text.slice(0, 500),
          operationName,
          url,
        });

        return err([
          {
            code: "INVALID_JSON_ERROR",
            message: "Failed to parse response as JSON",
          },
        ]);
      }

      if (!response.ok) {
        if (body.errors?.length) {
          logger.error("GraphQL Error", {
            durationMs: duration,
            error: body["errors"],
            operationName,
            variables,
            url,
          });
        }

        return handleInvalidResponse({
          response,
          operationName,
          url,
          duration,
        });
      }

      if ("errors" in body && body.errors) {
        const firstError = body.errors[0];
        const exceptionCode =
          firstError?.extensions?.exception?.code ||
          firstError?.extensions?.code ||
          undefined;

        logger.error("GraphQL Error", {
          durationMs: duration,
          error: body["errors"],
          operationName,
          exceptionCode,
          variables,
          url,
        });

        // Extract error messages from GraphQL errors
        const errorMessages = body.errors
          .map((e) => e.message || "GraphQL Error")
          .join(", ");

        return err([
          {
            code: "HTTP_ERROR",
            message: errorMessages || "GraphQL Error",
          },
        ]);
      }

      if (!body.data) {
        logger.error("HTTP Error: No data returned", {
          durationMs: duration,
          error: "No data field in GraphQL response",
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

      logger.debug("GraphQL request successful", {
        durationMs: duration,
        operationName,
        cached: !!options?.next?.tags,
      });

      return ok(body.data);
    } catch (e) {
      const duration = Math.round(performance.now() - startTime);

      // Better error serialization (plain object so logger does not receive Error prototype)
      const errorDetails: Record<string, unknown> =
        e instanceof Error
          ? {
              name: e.name,
              message: e.message,
              stack: e.stack,
              cause: e.cause,
            }
          : typeof e === "object" && e !== null
            ? { ...e, toString: String(e) }
            : { error: String(e) };

      logger.error("Unexpected HTTP error", {
        durationMs: duration,
        error: errorDetails,
        operationName,
        url,
        variables,
      });

      const errorMessage =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
            ? String(e.message)
            : "Unexpected HTTP error";

      return err([
        {
          code: "UNEXPECTED_HTTP_ERROR",
          message: errorMessage,
        },
      ]);
    }
  },
});

const handleInvalidResponse = ({
  operationName,
  response,
  url,
  duration,
}: {
  duration: number;
  operationName: string;
  response: Response;
  url: RequestInfo | URL;
}): Err => {
  // Add more cases for response.status if needed.
  switch (response.status) {
    case 404:
      logger.error("Not found", {
        durationMs: duration,
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
        durationMs: duration,
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
        durationMs: duration,
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

export type GraphqlClient = ReturnType<typeof graphqlClient>;
