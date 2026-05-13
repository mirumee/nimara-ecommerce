import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem_translation_MenuItemTranslation = { name: string };

export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category_translation_CategoryTranslation = { name: string | null, description: string | null };

export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation = { name: string };

export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute_attribute_Attribute = { name: string | null, slug: string | null, translation: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation | null };

export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute = { attribute: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute_attribute_Attribute };

export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product = { id: string, attributes: Array<MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_attributes_SelectedAttribute> };

export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge = { node: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product };

export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category_products_ProductCountableConnection = { edges: Array<MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category_products_ProductCountableConnection_edges_ProductCountableEdge> };

export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category = { id: string, slug: string, name: string, description: string | null, translation: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category_translation_CategoryTranslation | null, products: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category_products_ProductCountableConnection | null };

export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem_collection_Collection_translation_CollectionTranslation = { name: string | null, description: string | null };

export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem_collection_Collection_backgroundImage_Image = { url: string };

export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem_collection_Collection = { id: string, name: string, slug: string, description: string | null, translation: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_collection_Collection_translation_CollectionTranslation | null, backgroundImage: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_collection_Collection_backgroundImage_Image | null };

export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem_page_Page_translation_PageTranslation = { title: string | null };

export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem_page_Page = { id: string, title: string, slug: string, translation: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_page_Page_translation_PageTranslation | null };

export type MenuGet_menu_Menu_items_MenuItem_children_MenuItem = { id: string, name: string, level: number, url: string | null, translation: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_translation_MenuItemTranslation | null, category: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category | null, collection: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_collection_Collection | null, page: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_page_Page | null };

export type MenuGet_menu_Menu_items_MenuItem = { id: string, name: string, level: number, url: string | null, children: Array<MenuGet_menu_Menu_items_MenuItem_children_MenuItem> | null, translation: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_translation_MenuItemTranslation | null, category: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_category_Category | null, collection: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_collection_Collection | null, page: MenuGet_menu_Menu_items_MenuItem_children_MenuItem_page_Page | null };

export type MenuGet_menu_Menu = { items: Array<MenuGet_menu_Menu_items_MenuItem> | null };

export type MenuGet_Query = { menu: MenuGet_menu_Menu | null };


export type MenuGetVariables = Types.Exact<{
  slug?: Types.InputMaybe<Types.Scalars['String']['input']>;
  id?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  channel: Types.Scalars['String']['input'];
  languageCode: Types.LanguageCodeEnum;
}>;


export type MenuGet = MenuGet_Query;

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

export const MenuGetDocument = new TypedDocumentString(`
    query MenuGet($slug: String, $id: ID, $channel: String!, $languageCode: LanguageCodeEnum!) {
  menu(slug: $slug, id: $id, channel: $channel) {
    items {
      ...MenuItem
      children {
        ...MenuItem
      }
    }
  }
}
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
}`) as unknown as TypedDocumentString<MenuGet, MenuGetVariables>;