import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

import type { AsyncResult } from "@nimara/domain/objects/Result";

import { executeGraphQL } from "@/lib/graphql/execute";

const VENDOR_PROFILES_QUERY = `
  query VendorProfiles(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $filter: PageFilterInput
    $sortBy: PageSortingInput
  ) {
    vendorProfiles(
      first: $first
      last: $last
      after: $after
      before: $before
      filter: $filter
      sortBy: $sortBy
    ) {
      edges {
        node {
          id
          title
          slug
          created
          assignedAttributes {
            attribute {
              id
              slug
            }
            ... on AssignedPlainTextAttribute {
              plainTextValue: value
            }
            ... on AssignedSingleChoiceAttribute {
              choiceValue: value {
                name
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export type VendorProfile = {
  assignedAttributes: Array<{
    attribute: { id: string; slug: string };
    choiceValue?: { name: string | null } | null;
    plainTextValue?: string | null;
  }>;
  created: string;
  id: string;
  slug: string;
  title: string;
};

export type VendorProfilesResponse = {
  vendorProfiles: {
    edges: Array<{
      cursor: string;
      node: VendorProfile;
    }>;
    pageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
    };
    totalCount: number | null;
  } | null;
};

export type VendorProfilesVariables = {
  after?: string;
  before?: string;
  filter?: Record<string, unknown>;
  first?: number;
  last?: number;
  sortBy?: Record<string, unknown>;
};

const PAGE_UPDATE_MUTATION = `
  mutation PageUpdate($id: ID!, $input: PageInput!) {
    pageUpdate(id: $id, input: $input) {
      page {
        id
      }
      errors {
        code
        message
        field
      }
    }
  }
`;

export type PageUpdateResponse = {
  pageUpdate: {
    errors: Array<{ code: string; field?: string; message: string }>;
    page?: { id: string } | null;
  };
};

/** Service for listing vendors in the marketplace. */
class VendorsService {
  async getVendorProfiles(
    variables?: VendorProfilesVariables,
    token?: string | null,
  ): AsyncResult<VendorProfilesResponse> {
    const doc = {
      toString: () => VENDOR_PROFILES_QUERY,
    } as DocumentTypeDecoration<
      VendorProfilesResponse,
      VendorProfilesVariables
    > & {
      toString(): string;
    };

    return executeGraphQL(doc, "VendorProfilesQuery", variables, token);
  }

  async updateVendorStatus(
    pageId: string,
    attributeId: string,
    value: string,
    token?: string | null,
  ): AsyncResult<PageUpdateResponse> {
    const doc = {
      toString: () => PAGE_UPDATE_MUTATION,
    } as DocumentTypeDecoration<
      PageUpdateResponse,
      { id: string; input: unknown }
    > & {
      toString(): string;
    };

    return executeGraphQL(
      doc,
      "PageUpdateMutation",
      {
        id: pageId,
        input: {
          attributes: [
            {
              id: attributeId,
              dropdown: { value },
            },
          ],
        },
      },
      token,
    );
  }
}

export const vendorsService = new VendorsService();
