import { gql } from "graphql-request";
import { client } from "./client";
import { BulkDeleteResponse, Connection, Edge, IdNode } from "./types";

/**
 * Fetches ALL ids for a given entity, handling pagination.
 */
export async function fetchAllIds(entityField: string): Promise<string[]> {
  const ids: string[] = [];
  let after: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const query = gql`
      query ($after: String) {
        ${entityField}(first: 100, after: $after) {
          edges { node { id } }
          pageInfo { hasNextPage endCursor }
        }
      }
    `;
    const res: Record<string, Connection<IdNode>> =
      await client.request<Record<string, Connection<IdNode>>>(query, {
        after,
      });
    const connection: Connection<IdNode> = res[entityField];
    ids.push(...connection.edges.map((e: Edge<IdNode>) => e.node.id));
    hasNext = connection.pageInfo.hasNextPage;
    after = connection.pageInfo.endCursor;
  }

  return ids;
}

/**
 * Bulk-deletes entities by ids. Throws on Saleor-level errors.
 */
export async function bulkDelete(
  label: string,
  ids: string[],
  mutation: string
): Promise<void> {
  if (ids.length === 0) return;

  console.log(`[SEEDING] Deleting ${ids.length} ${label}...`);
  const res = await client.request<BulkDeleteResponse>(mutation, { ids });

  const key = Object.keys(res)[0];
  const errors = res[key].errors;

  if (errors.length > 0) {
    throw new Error(`Failed to delete ${label}: ${JSON.stringify(errors)}`);
  }
}
