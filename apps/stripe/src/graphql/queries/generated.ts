import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type ChannelsQuery_channels_Channel = { id: string, slug: string, name: string, currencyCode: string };

export type ChannelsQuery_Query = { channels: Array<ChannelsQuery_channels_Channel> | null };


export type ChannelsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ChannelsQuery = ChannelsQuery_Query;

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];

  constructor(private value: string, public __meta__?: Record<string, any>) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

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