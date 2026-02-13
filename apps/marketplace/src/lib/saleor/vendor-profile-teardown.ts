/**
 * Teardown Vendor Profile Model (Saleor Model / Page Type) on app uninstallation.
 *
 * Deletes all Pages of the Vendor Profile type, then deletes the page type.
 * Saleor restricts deleting a page type if it has instances.
 *
 * @see https://docs.saleor.io/developer/models
 */

const PAGES_QUERY = `
  query PagesByPageType($pageTypeId: ID!, $after: String) {
    pages(first: 100, filter: { pageTypes: [$pageTypeId] }, after: $after) {
      edges {
        node {
          id
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const PAGE_BULK_DELETE_MUTATION = `
  mutation PageBulkDelete($ids: [ID!]!) {
    pageBulkDelete(ids: $ids) {
      count
      errors {
        code
        message
        field
      }
    }
  }
`;

const PAGE_TYPE_DELETE_MUTATION = `
  mutation PageTypeDelete($id: ID!) {
    pageTypeDelete(id: $id) {
      errors {
        code
        message
        field
      }
      pageType {
        id
      }
    }
  }
`;

async function saleorFetch<T>(
  apiUrl: string,
  authToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ data?: T; errors?: Array<{ code?: string; message: string }> }> {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = (await res.json()) as {
    data?: T;
    errors?: Array<{ code?: string; message: string }>;
  };

  if (!res.ok) {
    throw new Error(
      `Saleor API error ${res.status}: ${body.errors?.[0]?.message ?? res.statusText}`,
    );
  }

  return body;
}

/**
 * Teardown the Vendor Profile page type and all its pages in Saleor.
 * Call this when the app is uninstalled to remove created resources.
 *
 * @param apiUrl - Saleor GraphQL endpoint (e.g. https://xxx.saleor.cloud/graphql/)
 * @param authToken - App JWT token (may be invalid if app already deleted)
 * @param pageTypeId - ID of the Vendor Profile page type to delete
 */
export async function teardownVendorProfileModel(
  apiUrl: string,
  authToken: string,
  pageTypeId: string,
): Promise<{
  error?: string;
  ok: boolean;
  tokenInvalid?: boolean;
}> {
  try {
    // 1. Fetch all pages of this page type (paginated)
    const allPageIds: string[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const pagesRes = await saleorFetch<{
        pages: {
          edges: Array<{ node: { id: string } }>;
          pageInfo: { endCursor: string | null; hasNextPage: boolean };
        };
      }>(apiUrl, authToken, PAGES_QUERY, {
        pageTypeId,
        after: cursor,
      });

      const pages = pagesRes.data?.pages;
      const errors = pagesRes.errors;

      if (errors?.length) {
        const isAuthError = errors.some(
          (e) =>
            e.code === "UNAUTHENTICATED" ||
            e.message?.toLowerCase().includes("unauthorized") ||
            e.message?.toLowerCase().includes("invalid token"),
        );

        if (isAuthError) {
          return { ok: false, tokenInvalid: true };
        }

        return {
          error: `Pages query: ${errors.map((e) => e.message).join(", ")}`,
          ok: false,
        };
      }

      if (!pages) {
        break;
      }

      for (const edge of pages.edges) {
        const id = edge.node.id;

        if (typeof id === "string") {
          allPageIds.push(id);
        }
      }

      hasNextPage = pages.pageInfo.hasNextPage ?? false;
      cursor = pages.pageInfo.endCursor;

      if (!hasNextPage || !cursor) {
        break;
      }
    }

    // 2. Delete all pages in batches (Saleor may limit bulk size)
    if (allPageIds.length > 0) {
      const batchSize = 50;

      for (let i = 0; i < allPageIds.length; i += batchSize) {
        const batch = allPageIds.slice(i, i + batchSize);
        const deleteRes = await saleorFetch<{
          pageBulkDelete: {
            errors?: Array<{ code?: string; message: string }>;
          };
        }>(apiUrl, authToken, PAGE_BULK_DELETE_MUTATION, { ids: batch });

        const bulkErrors =
          deleteRes.data?.pageBulkDelete?.errors ?? deleteRes.errors;

        if (bulkErrors?.length) {
          const isAuthError = bulkErrors.some(
            (e) =>
              e.code === "UNAUTHENTICATED" ||
              e.message?.toLowerCase().includes("unauthorized") ||
              e.message?.toLowerCase().includes("invalid token"),
          );

          if (isAuthError) {
            return { ok: false, tokenInvalid: true };
          }

          return {
            error: `Page bulk delete: ${bulkErrors.map((e) => e.message).join(", ")}`,
            ok: false,
          };
        }
      }
    }

    // 3. Delete the page type
    const pageTypeRes = await saleorFetch<{
      pageTypeDelete: {
        errors?: Array<{ code?: string; message: string }>;
        pageType?: { id: string } | null;
      };
    }>(apiUrl, authToken, PAGE_TYPE_DELETE_MUTATION, { id: pageTypeId });

    const ptErrors =
      pageTypeRes.data?.pageTypeDelete?.errors ?? pageTypeRes.errors;

    if (ptErrors?.length) {
      const isAuthError = ptErrors.some(
        (e) =>
          e.code === "UNAUTHENTICATED" ||
          e.message?.toLowerCase().includes("unauthorized") ||
          e.message?.toLowerCase().includes("invalid token"),
      );

      if (isAuthError) {
        return { ok: false, tokenInvalid: true };
      }

      return {
        error: `Page type delete: ${ptErrors.map((e) => e.message).join(", ")}`,
        ok: false,
      };
    }

    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown teardown error";

    // Check for 401 / token invalid
    const tokenInvalid =
      err instanceof Error &&
      (message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("401") ||
        message.toLowerCase().includes("invalid token"));

    return { error: message, ok: false, tokenInvalid: !!tokenInvalid };
  }
}
