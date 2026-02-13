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
  extensions?: { code?: string; exception?: { code?: string } };
  locations?: Array<{ column: number; line: number }>;
  message: string;
  path?: string[];
};
type GraphQLResponse<TData = any> = {
  data?: TData;
  errors?: Array<GraphqlError>;
  extensions?: {
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
      logger.debug("GraphQL request without caching", {
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
      const parsedResponse = await parseGraphQLResponse<TResult>(response);
      const { body } = parsedResponse;

      if (!response.ok) {
        return handleInvalidResponse({
          body,
          parsedResponse,
          response,
          operationName,
          url,
          duration,
          variables,
        });
      }

      if (!body) {
        logger.error("Invalid GraphQL response body", {
          durationMs: duration,
          operationName,
          url,
          variables,
          status: response.status,
          statusText: response.statusText,
          parseError: normalizeErrorForLogging(parsedResponse.parseError),
          responseBodySnippet: toSnippet(parsedResponse.rawBody),
        });

        return err([
          {
            code: "HTTP_ERROR",
            message: "Invalid GraphQL response body",
            status: response.status,
            context: {
              operationName,
              url,
            },
          },
        ]);
      }

      if (body.errors?.length) {
        const exceptionCode = getGraphqlExceptionCode(body.errors);
        const message = body.errors[0]?.message ?? "GraphQL Error";

        logger.error("GraphQL Error", {
          durationMs: duration,
          error: body.errors,
          operationName,
          exceptionCode,
          variables,
          url,
        });

        return err([
          {
            code: "HTTP_ERROR",
            message,
            context: {
              operationName,
              url,
              exceptionCode,
            },
          },
        ]);
      }

      if (typeof body.data === "undefined") {
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
      const normalizedError = normalizeErrorForLogging(e);
      const errorCode = "UNEXPECTED_HTTP_ERROR";
      const message = getUnexpectedRequestErrorMessage(e);

      logger.error("GraphQL request failed before receiving a valid response", {
        durationMs: duration,
        error: normalizedError,
        operationName,
        url,
        variables,
      });

      return err([
        {
          code: errorCode,
          message,
          context: {
            operationName,
            url,
          },
        },
      ]);
    }
  },
});

const handleInvalidResponse = ({
  body,
  parsedResponse,
  operationName,
  response,
  url,
  duration,
  variables,
}: {
  body: GraphQLResponse | null;
  duration: number;
  operationName: string;
  parsedResponse: ParsedGraphqlResponse;
  response: Response;
  url: RequestInfo | URL;
  variables?: AnyVariables;
}): Err => {
  const exceptionCode = getGraphqlExceptionCode(body?.errors);
  const graphqlMessage = body?.errors?.[0]?.message;
  const responseMessage = graphqlMessage ?? response.statusText;

  logger.error("API request failed", {
    durationMs: duration,
    message: responseMessage,
    status: response.status,
    operationName,
    url,
    variables,
    exceptionCode,
    graphqlErrors: body?.errors,
    parseError: normalizeErrorForLogging(parsedResponse.parseError),
    responseBodySnippet: toSnippet(parsedResponse.rawBody),
  });

  // Add more cases for response.status if needed.
  switch (response.status) {
    case 404:
      return err([
        {
          code: "NOT_FOUND_ERROR",
          status: response.status,
          message: responseMessage,
          context: {
            operationName,
            url,
            exceptionCode,
          },
        },
      ]);

    case 429:
      return err([
        {
          code: "TOO_MANY_REQUESTS_ERROR",
          status: response.status,
          message: responseMessage,
          context: {
            operationName,
            url,
            exceptionCode,
          },
        },
      ]);

    default:
      return err([
        {
          code: "HTTP_ERROR",
          status: response.status,
          message: responseMessage,
          context: {
            operationName,
            url,
            exceptionCode,
          },
        },
      ]);
  }
};

type ParsedGraphqlResponse<TResult = any> = {
  body: GraphQLResponse<TResult> | null;
  parseError?: unknown;
  rawBody?: string;
};

const parseGraphQLResponse = async <TResult>(
  response: Response,
): Promise<ParsedGraphqlResponse<TResult>> => {
  try {
    const rawBody = await response.text();

    if (!rawBody.trim()) {
      return { body: null, rawBody };
    }

    try {
      return {
        body: JSON.parse(rawBody) as GraphQLResponse<TResult>,
        rawBody,
      };
    } catch (parseError) {
      return { body: null, parseError, rawBody };
    }
  } catch (parseError) {
    return { body: null, parseError };
  }
};

const normalizeErrorForLogging = (error: unknown) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return { message: String(error) };
};

const getGraphqlExceptionCode = (errors?: Array<GraphqlError>) => {
  const firstError = errors?.[0];

  return (
    firstError?.extensions?.exception?.code ?? firstError?.extensions?.code
  );
};

const getUnexpectedRequestErrorMessage = (error: unknown) => {
  if (isAbortError(error)) {
    return "Request was aborted before receiving GraphQL response";
  }

  if (error instanceof TypeError) {
    return "Network error while calling GraphQL API";
  }

  return "Unexpected HTTP error";
};

const isAbortError = (error: unknown) => {
  return error instanceof DOMException && error.name === "AbortError";
};

const toSnippet = (value?: string) => {
  if (!value) {
    return undefined;
  }

  return value.slice(0, 500);
};

export type GraphqlClient = ReturnType<typeof graphqlClient>;
