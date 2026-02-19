import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

import type { AsyncResult } from "@nimara/domain/objects/Result";

import {
  type CollectionAddProducts,
  CollectionAddProductsDocument,
  type CollectionAddProductsVariables,
  type CollectionChannelListingUpdate,
  CollectionChannelListingUpdateDocument,
  type CollectionChannelListingUpdateInput,
  type CollectionChannelListingUpdateVariables,
  type CollectionCreateInput,
  type CollectionDetail,
  CollectionDetailDocument,
  type CollectionDetailVariables,
  type CollectionInput,
  type CollectionRemoveProducts,
  CollectionRemoveProductsDocument,
  type CollectionRemoveProductsVariables,
  type CollectionUpdate,
  CollectionUpdateDocument,
  type CollectionUpdateVariables,
  type VendorCollectionCreate,
  VendorCollectionCreateDocument,
  type VendorCollectionCreateVariables,
  type VendorCollectionDelete,
  VendorCollectionDeleteDocument,
  type VendorCollectionDeleteVariables,
} from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";

type DocumentWithToString = DocumentTypeDecoration<unknown, unknown> & {
  toString(): string;
};

/**
 * Service for marketplace collection operations.
 * All operations are scoped to the current vendor via the stitched GraphQL schema.
 */
class CollectionsService {
  async getCollection(
    variables: CollectionDetailVariables,
    token?: string | null,
  ): AsyncResult<CollectionDetail> {
    return executeGraphQL(
      CollectionDetailDocument,
      "CollectionDetailQuery",
      variables,
      token,
    );
  }

  async createCollection(
    variables: VendorCollectionCreateVariables,
    token?: string | null,
  ): AsyncResult<VendorCollectionCreate> {
    return executeGraphQL<
      VendorCollectionCreate,
      VendorCollectionCreateVariables
    >(
      VendorCollectionCreateDocument as DocumentWithToString,
      "VendorCollectionCreateMutation",
      variables,
      token,
    );
  }

  async updateCollection(
    variables: CollectionUpdateVariables,
    token?: string | null,
  ): AsyncResult<CollectionUpdate> {
    return executeGraphQL<CollectionUpdate, CollectionUpdateVariables>(
      CollectionUpdateDocument as DocumentWithToString,
      "CollectionUpdateMutation",
      variables,
      token,
    );
  }

  async updateCollectionChannelListing(
    variables: CollectionChannelListingUpdateVariables,
    token?: string | null,
  ): AsyncResult<CollectionChannelListingUpdate> {
    return executeGraphQL<
      CollectionChannelListingUpdate,
      CollectionChannelListingUpdateVariables
    >(
      CollectionChannelListingUpdateDocument as DocumentWithToString,
      "CollectionChannelListingUpdateMutation",
      variables,
      token,
    );
  }

  async deleteCollection(
    variables: VendorCollectionDeleteVariables,
    token?: string | null,
  ): AsyncResult<VendorCollectionDelete> {
    return executeGraphQL<
      VendorCollectionDelete,
      VendorCollectionDeleteVariables
    >(
      VendorCollectionDeleteDocument as DocumentWithToString,
      "VendorCollectionDeleteMutation",
      variables,
      token,
    );
  }

  async addProductsToCollection(
    variables: CollectionAddProductsVariables,
    token?: string | null,
  ): AsyncResult<CollectionAddProducts> {
    return executeGraphQL<
      CollectionAddProducts,
      CollectionAddProductsVariables
    >(
      CollectionAddProductsDocument as DocumentWithToString,
      "CollectionAddProductsMutation",
      variables,
      token,
    );
  }

  async removeProductsFromCollection(
    variables: CollectionRemoveProductsVariables,
    token?: string | null,
  ): AsyncResult<CollectionRemoveProducts> {
    return executeGraphQL<
      CollectionRemoveProducts,
      CollectionRemoveProductsVariables
    >(
      CollectionRemoveProductsDocument as DocumentWithToString,
      "CollectionRemoveProductsMutation",
      variables,
      token,
    );
  }
}

export const collectionsService = new CollectionsService();

// Re-export input types for convenience
export type { CollectionCreateInput, CollectionInput };
export type { CollectionChannelListingUpdateInput };
