import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type MenuItem_MenuItem_translation_MenuItemTranslation = { name: string };

export type MenuItem_MenuItem_category_Category_translation_CategoryTranslation = { name: string | null, description: string | null };

export type MenuItem_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation = { name: string };

export type MenuItem_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute_attribute_Attribute = { name: string | null, slug: string | null, translation: MenuItem_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation | null };

export type MenuItem_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute = { attribute: MenuItem_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute_attribute_Attribute };

export type MenuItem_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product = { id: string, attributes: Array<MenuItem_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute> };

export type MenuItem_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge = { node: MenuItem_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product };

export type MenuItem_MenuItem_category_Category_products_ProductCountableConnection = { edges: Array<MenuItem_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge> };

export type MenuItem_MenuItem_category_Category = { id: string, slug: string, name: string, description: string | null, translation: MenuItem_MenuItem_category_Category_translation_CategoryTranslation | null, products: MenuItem_MenuItem_category_Category_products_ProductCountableConnection | null };

export type MenuItem_MenuItem_collection_Collection_translation_CollectionTranslation = { name: string | null, description: string | null };

export type MenuItem_MenuItem_collection_Collection_backgroundImage_Image = { url: string };

export type MenuItem_MenuItem_collection_Collection = { id: string, name: string, slug: string, description: string | null, translation: MenuItem_MenuItem_collection_Collection_translation_CollectionTranslation | null, backgroundImage: MenuItem_MenuItem_collection_Collection_backgroundImage_Image | null };

export type MenuItem_MenuItem_page_Page_translation_PageTranslation = { title: string | null };

export type MenuItem_MenuItem_page_Page = { id: string, title: string, slug: string, translation: MenuItem_MenuItem_page_Page_translation_PageTranslation | null };

export type MenuItem = { id: string, name: string, level: number, url: string | null, translation: MenuItem_MenuItem_translation_MenuItemTranslation | null, category: MenuItem_MenuItem_category_Category | null, collection: MenuItem_MenuItem_collection_Collection | null, page: MenuItem_MenuItem_page_Page | null };

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
export const MenuItem = new TypedDocumentString(`
    fragment MenuItem on MenuItem {
  id
  name
  translation(languageCode: $languageCode) {
    name
  }
  level
  category {
    id
    slug
    name
    translation(languageCode: $languageCode) {
      name
      description
    }
    description
    products(first: 10, channel: "default-channel") {
      edges {
        node {
          attributes {
            attribute {
              name
              translation(languageCode: $languageCode) {
                name
              }
              slug
            }
          }
          id
        }
      }
    }
  }
  collection {
    id
    name
    translation(languageCode: $languageCode) {
      name
      description
    }
    slug
    description
    backgroundImage {
      url
    }
  }
  page {
    id
    title
    translation(languageCode: $languageCode) {
      title
    }
    slug
  }
  url
}
    `, {"fragmentName":"MenuItem"}) as unknown as TypedDocumentString<MenuItem, unknown>;