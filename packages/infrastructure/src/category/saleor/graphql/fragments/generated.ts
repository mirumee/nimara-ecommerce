import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CategoryFragment_Category_backgroundImage_Image = { url: string, alt: string | null };

export type CategoryFragment = { id: string, name: string, slug: string, description: string | null, seoTitle: string | null, seoDescription: string | null, backgroundImage: CategoryFragment_Category_backgroundImage_Image | null };

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
export const CategoryFragment = new TypedDocumentString(`
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
}
    `, {"fragmentName":"CategoryFragment"}) as unknown as TypedDocumentString<CategoryFragment, unknown>;