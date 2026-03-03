import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

import type { AsyncResult } from "@nimara/domain/objects/Result";

import {
  type CategoriesList,
  CategoriesListDocument,
  type CategoriesListVariables,
  type CollectionsList,
  CollectionsListDocument,
  type CollectionsListVariables,
  type ProductCreateMutation,
  ProductCreateMutationDocument,
  type ProductCreateMutationVariables,
  type ProductDeleteMutation,
  ProductDeleteMutationDocument,
  type ProductDeleteMutationVariables,
  type ProductDetail,
  ProductDetailDocument,
  type ProductDetailVariables,
  type ProductMediaCreateMutation,
  ProductMediaCreateMutationDocument,
  type ProductMediaCreateMutationVariables,
  type ProductMediaDeleteMutation,
  ProductMediaDeleteMutationDocument,
  type ProductMediaDeleteMutationVariables,
  type ProductMediaReorderMutation,
  ProductMediaReorderMutationDocument,
  type ProductMediaReorderMutationVariables,
  type ProductMediaUpdateMutation,
  ProductMediaUpdateMutationDocument,
  type ProductMediaUpdateMutationVariables,
  type Products,
  ProductsDocument,
  type ProductsVariables,
  type ProductTypeDetail,
  ProductTypeDetailDocument,
  type ProductTypeDetailVariables,
  type ProductTypesList,
  ProductTypesListDocument,
  type ProductTypesListVariables,
  type ProductVariantBulkUpdateMutation,
  ProductVariantBulkUpdateMutationDocument,
  type ProductVariantBulkUpdateMutationVariables,
  type ProductVariantChannelListingUpdateMutation,
  ProductVariantChannelListingUpdateMutationDocument,
  type ProductVariantChannelListingUpdateMutationVariables,
  type ProductVariantCreateMutation,
  ProductVariantCreateMutationDocument,
  type ProductVariantCreateMutationVariables,
  type ProductVariantDeleteMutation,
  ProductVariantDeleteMutationDocument,
  type ProductVariantDeleteMutationVariables,
  type ProductVariantDetail,
  ProductVariantDetailDocument,
  type ProductVariantDetailVariables,
  type ProductVariantUpdateMutation,
  ProductVariantUpdateMutationDocument,
  type ProductVariantUpdateMutationVariables,
  type UpdateProduct,
  type UpdateProductChannelListing,
  UpdateProductChannelListingDocument,
  type UpdateProductChannelListingVariables,
  UpdateProductDocument,
  type UpdateProductVariables,
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

  async createProduct(
    variables: ProductCreateMutationVariables,
    token?: string | null,
  ): AsyncResult<ProductCreateMutation> {
    return executeGraphQL<
      ProductCreateMutation,
      ProductCreateMutationVariables
    >(
      ProductCreateMutationDocument as DocumentTypeDecoration<
        ProductCreateMutation,
        ProductCreateMutationVariables
      > &
        DocumentWithToString,
      "ProductCreateMutation",
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
    return executeGraphQL<
      ProductMediaCreateMutation,
      ProductMediaCreateMutationVariables
    >(
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
    return executeGraphQL<
      ProductMediaUpdateMutation,
      ProductMediaUpdateMutationVariables
    >(
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
    return executeGraphQL<
      ProductMediaDeleteMutation,
      ProductMediaDeleteMutationVariables
    >(
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

  async productMediaReorder(
    variables: ProductMediaReorderMutationVariables,
    token?: string | null,
  ): AsyncResult<ProductMediaReorderMutation> {
    return executeGraphQL<
      ProductMediaReorderMutation,
      ProductMediaReorderMutationVariables
    >(
      ProductMediaReorderMutationDocument as DocumentTypeDecoration<
        ProductMediaReorderMutation,
        ProductMediaReorderMutationVariables
      > &
        DocumentWithToString,
      "ProductMediaReorderMutation",
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

  async productVariantCreate(
    variables: ProductVariantCreateMutationVariables,
    token?: string | null,
  ): AsyncResult<ProductVariantCreateMutation> {
    return executeGraphQL<
      ProductVariantCreateMutation,
      ProductVariantCreateMutationVariables
    >(
      ProductVariantCreateMutationDocument as DocumentTypeDecoration<
        ProductVariantCreateMutation,
        ProductVariantCreateMutationVariables
      > &
        DocumentWithToString,
      "ProductVariantCreateMutation",
      variables,
      token,
    );
  }

  async productVariantChannelListingUpdate(
    variables: ProductVariantChannelListingUpdateMutationVariables,
    token?: string | null,
  ): AsyncResult<ProductVariantChannelListingUpdateMutation> {
    return executeGraphQL<
      ProductVariantChannelListingUpdateMutation,
      ProductVariantChannelListingUpdateMutationVariables
    >(
      ProductVariantChannelListingUpdateMutationDocument as DocumentTypeDecoration<
        ProductVariantChannelListingUpdateMutation,
        ProductVariantChannelListingUpdateMutationVariables
      > &
        DocumentWithToString,
      "ProductVariantChannelListingUpdateMutation",
      variables,
      token,
    );
  }

  async productVariantUpdate(
    variables: ProductVariantUpdateMutationVariables,
    token?: string | null,
  ): AsyncResult<ProductVariantUpdateMutation> {
    return executeGraphQL<
      ProductVariantUpdateMutation,
      ProductVariantUpdateMutationVariables
    >(
      ProductVariantUpdateMutationDocument as DocumentTypeDecoration<
        ProductVariantUpdateMutation,
        ProductVariantUpdateMutationVariables
      > &
        DocumentWithToString,
      "ProductVariantUpdateMutation",
      variables,
      token,
    );
  }

  async deleteVariant(
    variables: ProductVariantDeleteMutationVariables,
    token?: string | null,
  ): AsyncResult<ProductVariantDeleteMutation> {
    return executeGraphQL<
      ProductVariantDeleteMutation,
      ProductVariantDeleteMutationVariables
    >(
      ProductVariantDeleteMutationDocument as DocumentTypeDecoration<
        ProductVariantDeleteMutation,
        ProductVariantDeleteMutationVariables
      > &
        DocumentWithToString,
      "ProductVariantDeleteMutation",
      variables,
      token,
    );
  }

  async deleteProduct(
    variables: ProductDeleteMutationVariables,
    token?: string | null,
  ): AsyncResult<ProductDeleteMutation> {
    return executeGraphQL<
      ProductDeleteMutation,
      ProductDeleteMutationVariables
    >(
      ProductDeleteMutationDocument as DocumentTypeDecoration<
        ProductDeleteMutation,
        ProductDeleteMutationVariables
      > &
        DocumentWithToString,
      "ProductDeleteMutation",
      variables,
      token,
    );
  }
}

export const productsService = new ProductsService();
