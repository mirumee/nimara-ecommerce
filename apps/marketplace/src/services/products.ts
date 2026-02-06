import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

import type { AsyncResult } from "@nimara/domain/objects/Result";

import {
  type CategoriesList,
  CategoriesListDocument,
  type CategoriesListVariables,
  type CollectionsList,
  CollectionsListDocument,
  type CollectionsListVariables,
  type ProductDetail,
  ProductDetailDocument,
  type ProductDetailVariables,
  type ProductMediaCreateMutation,
  ProductMediaCreateMutationDocument,
  type ProductMediaCreateMutationVariables,
  type ProductMediaDeleteMutation,
  ProductMediaDeleteMutationDocument,
  type ProductMediaDeleteMutationVariables,
  type ProductMediaUpdateMutation,
  ProductMediaUpdateMutationDocument,
  type ProductMediaUpdateMutationVariables,
  type ProductVariantBulkUpdateMutation,
  ProductVariantBulkUpdateMutationDocument,
  type ProductVariantBulkUpdateMutationVariables,
  type ProductVariantDetail,
  ProductVariantDetailDocument,
  type ProductVariantDetailVariables,
  type ProductTypeDetail,
  ProductTypeDetailDocument,
  type ProductTypeDetailVariables,
  type ProductTypesList,
  ProductTypesListDocument,
  type ProductTypesListVariables,
  type Products,
  ProductsDocument,
  type ProductsVariables,
  type UpdateProduct,
  UpdateProductDocument,
  type UpdateProductVariables,
  type UpdateProductChannelListing,
  UpdateProductChannelListingDocument,
  type UpdateProductChannelListingVariables,
} from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";

type DocumentWithToString = DocumentTypeDecoration<unknown, unknown> & {
  toString(): string;
};

/**
 * Service for marketplace product operations.
 * Handles product listing and detail queries.
 */
class ProductsService {
  async getProducts(
    variables?: ProductsVariables,
    token?: string | null,
  ): AsyncResult<Products> {
    return executeGraphQL(ProductsDocument, "ProductsQuery", variables, token);
  }

  async getProduct(
    variables: ProductDetailVariables,
    token?: string | null,
  ): AsyncResult<ProductDetail> {
    return executeGraphQL(
      ProductDetailDocument,
      "ProductDetailQuery",
      variables,
      token,
    );
  }

  async getProductVariant(
    variables: ProductVariantDetailVariables,
    token?: string | null,
  ): AsyncResult<ProductVariantDetail> {
    return executeGraphQL(
      ProductVariantDetailDocument,
      "ProductVariantDetailQuery",
      variables,
      token,
    );
  }

  async getCategories(
    variables?: CategoriesListVariables,
    token?: string | null,
  ): AsyncResult<CategoriesList> {
    return executeGraphQL(
      CategoriesListDocument,
      "CategoriesListQuery",
      variables,
      token,
    );
  }

  async getCollections(
    variables?: CollectionsListVariables,
    token?: string | null,
  ): AsyncResult<CollectionsList> {
    return executeGraphQL(
      CollectionsListDocument,
      "CollectionsListQuery",
      variables,
      token,
    );
  }

  async getProductTypes(
    variables?: ProductTypesListVariables,
    token?: string | null,
  ): AsyncResult<ProductTypesList> {
    return executeGraphQL(
      ProductTypesListDocument,
      "ProductTypesListQuery",
      variables,
      token,
    );
  }

  async getProductType(
    variables: ProductTypeDetailVariables,
    token?: string | null,
  ): AsyncResult<ProductTypeDetail> {
    return executeGraphQL(
      ProductTypeDetailDocument,
      "ProductTypeDetailQuery",
      variables,
      token,
    );
  }

  async updateProduct(
    variables: UpdateProductVariables,
    token?: string | null,
  ): AsyncResult<UpdateProduct> {
    return executeGraphQL<UpdateProduct, UpdateProductVariables>(
      UpdateProductDocument as DocumentTypeDecoration<
        UpdateProduct,
        UpdateProductVariables
      > &
        DocumentWithToString,
      "UpdateProductMutation",
      variables,
      token,
    );
  }

  async updateProductChannelListing(
    variables: UpdateProductChannelListingVariables,
    token?: string | null,
  ): AsyncResult<UpdateProductChannelListing> {
    return executeGraphQL<
      UpdateProductChannelListing,
      UpdateProductChannelListingVariables
    >(
      UpdateProductChannelListingDocument as DocumentTypeDecoration<
        UpdateProductChannelListing,
        UpdateProductChannelListingVariables
      > &
        DocumentWithToString,
      "UpdateProductChannelListingMutation",
      variables,
      token,
    );
  }

  async productMediaCreate(
    variables: ProductMediaCreateMutationVariables,
    token?: string | null,
  ): AsyncResult<ProductMediaCreateMutation> {
    return executeGraphQL<ProductMediaCreateMutation, ProductMediaCreateMutationVariables>(
      ProductMediaCreateMutationDocument as DocumentTypeDecoration<
        ProductMediaCreateMutation,
        ProductMediaCreateMutationVariables
      > &
        DocumentWithToString,
      "ProductMediaCreateMutation",
      variables,
      token,
    );
  }

  async productMediaUpdate(
    variables: ProductMediaUpdateMutationVariables,
    token?: string | null,
  ): AsyncResult<ProductMediaUpdateMutation> {
    return executeGraphQL<ProductMediaUpdateMutation, ProductMediaUpdateMutationVariables>(
      ProductMediaUpdateMutationDocument as DocumentTypeDecoration<
        ProductMediaUpdateMutation,
        ProductMediaUpdateMutationVariables
      > &
        DocumentWithToString,
      "ProductMediaUpdateMutation",
      variables,
      token,
    );
  }

  async productMediaDelete(
    variables: ProductMediaDeleteMutationVariables,
    token?: string | null,
  ): AsyncResult<ProductMediaDeleteMutation> {
    return executeGraphQL<ProductMediaDeleteMutation, ProductMediaDeleteMutationVariables>(
      ProductMediaDeleteMutationDocument as DocumentTypeDecoration<
        ProductMediaDeleteMutation,
        ProductMediaDeleteMutationVariables
      > &
        DocumentWithToString,
      "ProductMediaDeleteMutation",
      variables,
      token,
    );
  }

  async productVariantBulkUpdate(
    variables: ProductVariantBulkUpdateMutationVariables,
    token?: string | null,
  ): AsyncResult<ProductVariantBulkUpdateMutation> {
    return executeGraphQL<
      ProductVariantBulkUpdateMutation,
      ProductVariantBulkUpdateMutationVariables
    >(
      ProductVariantBulkUpdateMutationDocument as DocumentTypeDecoration<
        ProductVariantBulkUpdateMutation,
        ProductVariantBulkUpdateMutationVariables
      > &
        DocumentWithToString,
      "ProductVariantBulkUpdateMutation",
      variables,
      token,
    );
  }
}

export const productsService = new ProductsService();
