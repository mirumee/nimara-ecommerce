import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CategoriesIDsBySlugs_categories_CategoryCountableConnection_edges_CategoryCountableEdge_node_Category = { id: string };

export type CategoriesIDsBySlugs_categories_CategoryCountableConnection_edges_CategoryCountableEdge = { node: CategoriesIDsBySlugs_categories_CategoryCountableConnection_edges_CategoryCountableEdge_node_Category };

export type CategoriesIDsBySlugs_categories_CategoryCountableConnection = { edges: Array<CategoriesIDsBySlugs_categories_CategoryCountableConnection_edges_CategoryCountableEdge> };

export type CategoriesIDsBySlugs_Query = { categories: CategoriesIDsBySlugs_categories_CategoryCountableConnection | null };


export type CategoriesIDsBySlugsVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  slugs?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
}>;


export type CategoriesIDsBySlugs = CategoriesIDsBySlugs_Query;

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

export const CategoriesIDsBySlugsDocument = new TypedDocumentString(`
    query CategoriesIDsBySlugs($first: Int = 10, $slugs: [String!]) {
  categories(first: $first, filter: {slugs: $slugs}) {
    edges {
      node {
        id
      }
    }
  }
}
    `) as unknown as TypedDocumentString<CategoriesIDsBySlugs, CategoriesIDsBySlugsVariables>;