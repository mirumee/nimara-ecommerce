import type { AsyncResult } from "@nimara/domain/objects/Result";

import {
  type CollectionAddProductsMutation,
  CollectionAddProductsMutationDocument,
  type CollectionAddProductsMutationVariables,
  type CollectionChannelListingUpdateMutation,
  CollectionChannelListingUpdateMutationDocument,
  type CollectionChannelListingUpdateInput,
  type CollectionChannelListingUpdateMutationVariables,
  type CollectionCreateInput,
  type CollectionDetail,
  CollectionDetailDocument,
  type CollectionDetailVariables,
  type CollectionInput,
  type CollectionRemoveProductsMutation,
  CollectionRemoveProductsMutationDocument,
  type CollectionRemoveProductsMutationVariables,
  type CollectionUpdateMutation,
  CollectionUpdateMutationDocument,
  type CollectionUpdateMutationVariables,
  type VendorCollectionCreate,
  VendorCollectionCreateDocument,
  type VendorCollectionCreateVariables,
  type VendorCollectionDelete,
  VendorCollectionDeleteDocument,
  type VendorCollectionDeleteVariables,
} from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";

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
      VendorCollectionCreateDocument,
      "VendorCollectionCreateMutation",
      variables,
      token,
    );
  }

  async updateCollection(
    variables: CollectionUpdateMutationVariables,
    token?: string | null,
  ): AsyncResult<CollectionUpdateMutation> {
    return executeGraphQL<
      CollectionUpdateMutation,
      CollectionUpdateMutationVariables
    >(
      CollectionUpdateMutationDocument,
      "CollectionUpdateMutation",
      variables,
      token,
    );
  }

  async updateCollectionChannelListing(
    variables: CollectionChannelListingUpdateMutationVariables,
    token?: string | null,
  ): AsyncResult<CollectionChannelListingUpdateMutation> {
    return executeGraphQL<
      CollectionChannelListingUpdateMutation,
      CollectionChannelListingUpdateMutationVariables
    >(
      CollectionChannelListingUpdateMutationDocument,
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
      VendorCollectionDeleteDocument,
      "VendorCollectionDeleteMutation",
      variables,
      token,
    );
  }

  async addProductsToCollection(
    variables: CollectionAddProductsMutationVariables,
    token?: string | null,
  ): AsyncResult<CollectionAddProductsMutation> {
    return executeGraphQL<
      CollectionAddProductsMutation,
      CollectionAddProductsMutationVariables
    >(
      CollectionAddProductsMutationDocument,
      "CollectionAddProductsMutation",
      variables,
      token,
    );
  }

  async removeProductsFromCollection(
    variables: CollectionRemoveProductsMutationVariables,
    token?: string | null,
  ): AsyncResult<CollectionRemoveProductsMutation> {
    return executeGraphQL<
      CollectionRemoveProductsMutation,
      CollectionRemoveProductsMutationVariables
    >(
      CollectionRemoveProductsMutationDocument,
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
