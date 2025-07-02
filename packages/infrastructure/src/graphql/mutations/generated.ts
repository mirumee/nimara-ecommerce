import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type MetadataUpdateMutation_updateMetadata_UpdateMetadata_item_Address_metadata_MetadataItem = { key: string, value: string };

export type MetadataUpdateMutation_updateMetadata_UpdateMetadata_item_WyJ2yV8kbV43ZuNk2LnMpdht4wzJk1vzx9OO77bTYA = { metadata: Array<MetadataUpdateMutation_updateMetadata_UpdateMetadata_item_Address_metadata_MetadataItem> };

export type MetadataUpdateMutation_updateMetadata_UpdateMetadata_item_NoYDRO3cg6qyD5DB6BzM4ezHkwXTKXAXyLqRKqBaUE = { metadata: Array<MetadataUpdateMutation_updateMetadata_UpdateMetadata_item_Address_metadata_MetadataItem> };

export type MetadataUpdateMutation_updateMetadata_UpdateMetadata_item = MetadataUpdateMutation_updateMetadata_UpdateMetadata_item_WyJ2yV8kbV43ZuNk2LnMpdht4wzJk1vzx9OO77bTYA | MetadataUpdateMutation_updateMetadata_UpdateMetadata_item_NoYDRO3cg6qyD5DB6BzM4ezHkwXTKXAXyLqRKqBaUE;

export type MetadataUpdateMutation_updateMetadata_UpdateMetadata_errors_MetadataError = { field: string | null, code: Types.MetadataErrorCode, message: string | null };

export type MetadataUpdateMutation_updateMetadata_UpdateMetadata = { item: MetadataUpdateMutation_updateMetadata_UpdateMetadata_item | null, errors: Array<MetadataUpdateMutation_updateMetadata_UpdateMetadata_errors_MetadataError> };

export type MetadataUpdateMutation_Mutation = { updateMetadata: MetadataUpdateMutation_updateMetadata_UpdateMetadata | null };


export type MetadataUpdateMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  input: Array<Types.MetadataInput> | Types.MetadataInput;
}>;


export type MetadataUpdateMutation = MetadataUpdateMutation_Mutation;

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
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

export const MetadataUpdateMutationDocument = new TypedDocumentString(`
    mutation MetadataUpdateMutation($id: ID!, $input: [MetadataInput!]!) {
  updateMetadata(id: $id, input: $input) {
    item {
      metadata {
        ...MetadataItemFragment
      }
    }
    errors {
      ...MetadataErrorFragment
    }
  }
}
    fragment MetadataItemFragment on MetadataItem {
  key
  value
}
fragment MetadataErrorFragment on MetadataError {
  field
  code
  message
}`) as unknown as TypedDocumentString<MetadataUpdateMutation, MetadataUpdateMutationVariables>;