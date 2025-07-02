import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Page_page_Page_attributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation = { name: string };

export type Page_page_Page_attributes_SelectedAttribute_attribute_Attribute = { slug: string | null, inputType: Types.AttributeInputTypeEnum | null, name: string | null, translation: Page_page_Page_attributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation | null };

export type Page_page_Page_attributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation = { name: string, plainText: string | null, richText: string | null };

export type Page_page_Page_attributes_SelectedAttribute_values_AttributeValue_file_File = { url: string };

export type Page_page_Page_attributes_SelectedAttribute_values_AttributeValue = { slug: string | null, name: string | null, plainText: string | null, richText: string | null, boolean: boolean | null, date: string | null, dateTime: string | null, reference: string | null, value: string | null, translation: Page_page_Page_attributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation | null, file: Page_page_Page_attributes_SelectedAttribute_values_AttributeValue_file_File | null };

export type Page_page_Page_attributes_SelectedAttribute = { attribute: Page_page_Page_attributes_SelectedAttribute_attribute_Attribute, values: Array<Page_page_Page_attributes_SelectedAttribute_values_AttributeValue> };

export type Page_page_Page = { title: string, content: string | null, attributes: Array<Page_page_Page_attributes_SelectedAttribute> };

export type Page_Query = { page: Page_page_Page | null };


export type PageVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
  languageCode: Types.LanguageCodeEnum;
}>;


export type Page = Page_Query;

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

export const PageDocument = new TypedDocumentString(`
    query Page($slug: String!, $languageCode: LanguageCodeEnum!) {
  page(slug: $slug) {
    attributes {
      attribute {
        ...AttributeFragment
      }
      values {
        ...AttributeValueFragment
      }
    }
    title
    content
  }
}
    fragment AttributeFragment on Attribute {
  slug
  inputType
  name
  translation(languageCode: $languageCode) {
    name
  }
}
fragment AttributeValueFragment on AttributeValue {
  slug
  name
  plainText
  richText
  boolean
  date
  dateTime
  reference
  value
  translation(languageCode: $languageCode) {
    name
    plainText
    richText
  }
  file {
    url
  }
}`) as unknown as TypedDocumentString<Page, PageVariables>;