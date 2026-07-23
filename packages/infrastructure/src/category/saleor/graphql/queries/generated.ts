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

export type CategoryDetailsQuery_category_Category_backgroundImage_Image = { url: string, alt: string | null };

export type CategoryDetailsQuery_category_Category_translation_CategoryTranslation = { name: string | null, description: string | null, seoTitle: string | null, seoDescription: string | null };

export type CategoryDetailsQuery_category_Category = { id: string, name: string, slug: string, description: string | null, seoTitle: string | null, seoDescription: string | null, backgroundImage: CategoryDetailsQuery_category_Category_backgroundImage_Image | null, translation: CategoryDetailsQuery_category_Category_translation_CategoryTranslation | null };

export type CategoryDetailsQuery_Query = { category: CategoryDetailsQuery_category_Category | null };


export type CategoryDetailsQueryVariables = Types.Exact<{
  slug?: Types.InputMaybe<Types.Scalars['String']['input']>;
  languageCode: Types.LanguageCodeEnum;
}>;


export type CategoryDetailsQuery = CategoryDetailsQuery_Query;

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
export const CategoryDetailsQueryDocument = new TypedDocumentString(`
    query CategoryDetailsQuery($slug: String, $languageCode: LanguageCodeEnum!) {
  category(slug: $slug) {
    ...CategoryFragment
  }
}
    fragment CategoryFragment on Category {
  id
  name
  slug
  description
  seoTitle
  seoDescription
  backgroundImage {
    url
    alt
  }
  translation(languageCode: $languageCode) {
    name
    description
    seoTitle
    seoDescription
  }
}`) as unknown as TypedDocumentString<CategoryDetailsQuery, CategoryDetailsQueryVariables>;