import { isObject } from "@/lib/misc";
import { type getLoggingProvider } from "@/providers/logging";

import {
  GraphQLClientHttpError,
  GraphQLClientInvalidResponseError,
  GraphQLClientMultiGraphQLError,
} from "./error";
import {
  type AnyVariables,
  type FetchOptions,
  type GraphQLResponse,
  type TypedDocument,
} from "./types";
import { getOperationName } from "./utils";

export type GraphqlClient<RevalidateTag extends string = string> = ReturnType<
  typeof graphqlClient<RevalidateTag>
>;

export type GraphqlClientOpts = {
  authToken?: string;
  logger?: ReturnType<typeof getLoggingProvider>;
  timeout?: number;
};

export const graphqlClient = <RevalidateTag extends string = string>(
  url: string,
  opts?: GraphqlClientOpts,
) => ({
  execute: async <
    TResult = unknown,
    TVariables extends AnyVariables = AnyVariables,
  >(
    query: TypedDocument<TResult, TVariables>,
    input?: {
      options?: FetchOptions<RevalidateTag>;
      variables?: TVariables;
    },
  ): Promise<TResult> => {
    const { authToken, timeout, logger } = {
      timeout: 10000,
      ...opts,
    };
    const { variables, options } = input ?? {};
    const stringQuery = query.toString();
    const start = performance.now();

    const logOperation = (start: DOMHighResTimeStamp) => {
      logger?.info(`Executed ${getOperationName(stringQuery)} operation.`, {
        took: (performance.now() - start).toFixed(2) + "ms",
        variables,
      });
    };

    const response = await fetch(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: JSON.stringify({
        query: stringQuery,
        ...(variables && { variables }),
      }),
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      const message = await response.text();

      throw new GraphQLClientHttpError(message, {
        cause: {
          statusCode: response.status,
          message: response.statusText,
        },
      });
    }

    const responseJson = (await response.json()) as GraphQLResponse<TResult>;

    logOperation(start);

    if (!isObject(responseJson) || !("data" in responseJson)) {
      logger?.error("Invalid json response.", { responseJson, variables });
      throw new GraphQLClientInvalidResponseError("Invalid json response.", {
        cause: { json: responseJson },
      });
    }

    const data = responseJson["data"];
    const errors = responseJson["errors"];

    logger?.debug(
      `${getOperationName(stringQuery)} operation response: ${JSON.stringify(
        responseJson ?? {},
      )}`,
    );

    if (errors) {
      logger?.error("Graphql occurred error.", { data, errors, variables });
      throw new GraphQLClientMultiGraphQLError(
        errors.map(
          (error) =>
            new GraphQLClientInvalidResponseError(
              `Graphql error: ${error.message}.`,
              { cause: { error } },
            ),
        ),
      );
    }

    return data as TResult;
  },
});
