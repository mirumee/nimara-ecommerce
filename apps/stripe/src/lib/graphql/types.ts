import { type DocumentTypeDecoration } from "@graphql-typed-document-node/core";

export type NextFetchOptions<RevalidateTag extends string = string> = {
  next?: { revalidate?: number; tags?: RevalidateTag[] };
};

export type FetchOptions<RevalidateTag extends string = string> = Omit<
  RequestInit,
  "method" | "body"
> &
  NextFetchOptions<RevalidateTag>;

export type AnyVariables = Record<string, unknown> | undefined;

export type TypedDocument<TResult, TVariables> = DocumentTypeDecoration<
  TResult,
  TVariables
> & {
  toString(): string;
};

export type GraphqlError = {
  extensions: object;
  locations: object[];
  message: string;
  path: string[];
};

export type GraphQLResponse<TData = unknown> = {
  data?: TData;
  errors?: GraphqlError[];
  extensions: {
    cost?: {
      maximumAvailable: number;
      requestedQueryCost: number;
    };
    exception?: object;
  };
};
