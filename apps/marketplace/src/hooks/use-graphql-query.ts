"use client";

import { useEffect, useState } from "react";

import { graphqlFetcher } from "@/lib/graphql/client";

/** Document that can be stringified (e.g. TypedDocumentString from codegen). */
type GraphQLDocument = { toString(): string };

export interface UseGraphQLQueryOptions<TVariables> {
  enabled?: boolean;
  variables?: TVariables;
}

export function useGraphQLQuery<TData, TVariables>(
  document: GraphQLDocument,
  options: UseGraphQLQueryOptions<TVariables> = {},
): {
  data: TData | undefined;
  error: Error | null;
  isLoading: boolean;
} {
  const { enabled = true, variables } = options;
  const [data, setData] = useState<TData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);

return;
    }

    let cancelled = false;

    setIsLoading(true);
    setError(null);

    const queryString = document.toString();
    const fetcher = graphqlFetcher<TData, TVariables>(queryString, variables as TVariables);

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, document, JSON.stringify(variables)]);

  return { data, isLoading, error };
}
