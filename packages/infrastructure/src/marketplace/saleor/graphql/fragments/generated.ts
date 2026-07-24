import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type VendorProfileFragment_Page_assignedAttributes_AssignedAttribute_attribute_Attribute = { id: string, slug: string | null };

export type VendorProfileFragment_Page_assignedAttributes_f6lry4i9i0ZvmDcChJIzOZEbYSxnLm5kAXyhZyRRkE = { attribute: VendorProfileFragment_Page_assignedAttributes_AssignedAttribute_attribute_Attribute };

export type VendorProfileFragment = { id: string, title: string, content: string | null, slug: string, assignedAttributes: Array<VendorProfileFragment_Page_assignedAttributes_f6lry4i9i0ZvmDcChJIzOZEbYSxnLm5kAXyhZyRRkE> };

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
export const VendorProfileFragment = new TypedDocumentString(`
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
}
    `, {"fragmentName":"VendorProfileFragment"}) as unknown as TypedDocumentString<VendorProfileFragment, unknown>;