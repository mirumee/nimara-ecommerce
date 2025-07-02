import type * as Types from "@nimara/codegen/schema";

import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export type AppIdQuery_app_App = { id: string };

export type AppIdQuery_Query = { app: AppIdQuery_app_App | null };

export type AppIdQueryVariables = Types.Exact<{ [key: string]: never }>;

export type AppIdQuery = AppIdQuery_Query;

export type ChannelsQuery_channels_Channel = {
  id: string;
  slug: string;
  name: string;
  currencyCode: string;
};

export type ChannelsQuery_Query = {
  channels: Array<ChannelsQuery_channels_Channel> | null;
};

export type ChannelsQueryVariables = Types.Exact<{ [key: string]: never }>;

export type ChannelsQuery = ChannelsQuery_Query;

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<
    DocumentTypeDecoration<TResult, TVariables>["__apiType"]
  >;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const AppIdQueryDocument = new TypedDocumentString(`
    query AppIdQuery {
  app {
    id
  }
}
    `) as unknown as TypedDocumentString<AppIdQuery, AppIdQueryVariables>;
export const ChannelsQueryDocument = new TypedDocumentString(`
    query ChannelsQuery {
  channels {
    ...ChannelFragment
  }
}
    fragment ChannelFragment on Channel {
  id
  slug
  name
  currencyCode
}`) as unknown as TypedDocumentString<ChannelsQuery, ChannelsQueryVariables>;
