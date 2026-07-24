import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type VendorGetById_page_Page_assignedAttributes_AssignedAttribute_attribute_Attribute = { id: string, slug: string | null };

export type VendorGetById_page_Page_assignedAttributes_f6lry4i9i0ZvmDcChJIzOZEbYSxnLm5kAXyhZyRRkE = { attribute: VendorGetById_page_Page_assignedAttributes_AssignedAttribute_attribute_Attribute };

export type VendorGetById_page_Page = { id: string, title: string, content: string | null, slug: string, assignedAttributes: Array<VendorGetById_page_Page_assignedAttributes_f6lry4i9i0ZvmDcChJIzOZEbYSxnLm5kAXyhZyRRkE> };

export type VendorGetById_Query = { page: VendorGetById_page_Page | null };


export type VendorGetByIdVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type VendorGetById = VendorGetById_Query;

export type VendorGetBySlug_page_Page = { id: string, title: string, content: string | null, slug: string, assignedAttributes: Array<VendorGetById_page_Page_assignedAttributes_f6lry4i9i0ZvmDcChJIzOZEbYSxnLm5kAXyhZyRRkE> };

export type VendorGetBySlug_Query = { page: VendorGetBySlug_page_Page | null };


export type VendorGetBySlugVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
}>;


export type VendorGetBySlug = VendorGetBySlug_Query;

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

export const VendorGetByIdDocument = new TypedDocumentString(`
    query VendorGetByID($id: ID!) {
  page(id: $id) {
    ...VendorProfileFragment
  }
}
    fragment VendorProfileFragment on Page {
  id
  title
  content
  slug
  assignedAttributes {
    attribute {
      id
      slug
    }
  }
}`) as unknown as TypedDocumentString<VendorGetById, VendorGetByIdVariables>;
export const VendorGetBySlugDocument = new TypedDocumentString(`
    query VendorGetBySlug($slug: String!) {
  page(slug: $slug) {
    ...VendorProfileFragment
  }
}
    fragment VendorProfileFragment on Page {
  id
  title
  content
  slug
  assignedAttributes {
    attribute {
      id
      slug
    }
  }
}`) as unknown as TypedDocumentString<VendorGetBySlug, VendorGetBySlugVariables>;