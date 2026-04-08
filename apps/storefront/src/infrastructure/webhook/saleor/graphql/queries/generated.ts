import type * as Types from "@nimara/codegen/schema";

import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export type ProductSlugQuery_product_Product = { slug: string };

export type ProductSlugQuery_Query = {
  product: ProductSlugQuery_product_Product | null;
};

export type ProductSlugQueryVariables = Types.Exact<{
  id: Types.Scalars["ID"]["input"];
}>;

export type ProductSlugQuery = ProductSlugQuery_Query;

export type Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product =
  { name: string };

export type Products_products_ProductCountableConnection_edges_ProductCountableEdge =
  {
    node: Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product;
  };

export type Products_products_ProductCountableConnection = {
  edges: Array<Products_products_ProductCountableConnection_edges_ProductCountableEdge>;
};

export type Products_Query = {
  products: Products_products_ProductCountableConnection | null;
};

export type ProductsVariables = Types.Exact<{ [key: string]: never }>;

export type Products = Products_Query;

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<
    DocumentTypeDecoration<TResult, TVariables>["__apiType"]
  >;
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

export const ProductSlugQueryDocument = new TypedDocumentString(`
    query ProductSlugQuery($id: ID!) {
  product(id: $id) {
    slug
  }
}
    `) as unknown as TypedDocumentString<
  ProductSlugQuery,
  ProductSlugQueryVariables
>;
export const ProductsDocument = new TypedDocumentString(`
    query Products {
  products(first: 10) {
    edges {
      node {
        name
      }
    }
  }
}
    `) as unknown as TypedDocumentString<Products, ProductsVariables>;
