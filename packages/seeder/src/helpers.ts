import { gql } from "graphql-request";
import { client } from "./client";
import {
  BuildPageAttributesResult,
  BulkDeleteResponse,
  Connection,
  Edge,
  FileUploadTask,
  IdNode,
  MockData,
  ShopQueryResponse,
} from "./types";
import { HOMEPAGE_ATTRIBUTES } from "./constants";

/**
 * Fetches ALL ids for a given entity, handling pagination.
 * @param entityField - Field name for the entity.
 * @returns Promise<string[]>
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
    const res: Record<string, Connection<IdNode>> = await client.request<
      Record<string, Connection<IdNode>>
    >(query, {
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
 * @param label - Label for the entity.
 * @param ids - Array of entity ids to delete.
 * @param mutation - Bulk delete mutation.
 * @returns Promise<void>
 */
export async function bulkDelete(
  label: string,
  ids: string[],
  mutation: string,
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

/**
 * Builds page attributes for a given page.
 * @param attrIdsBySlug - Map of attribute slugs to attribute ids.
 * @param homepage - Homepage data.
 * @param productIds - Array of product ids.
 * @returns Object with attributes and file uploads.
 */

export function buildPageAttributes(
  attrIdsBySlug: Record<string, string>,
  homepage: MockData["homepage"],
  productIds: string[],
): BuildPageAttributesResult {
  const attributes: Record<string, unknown>[] = [];
  const fileUploads: FileUploadTask[] = [];

  for (const def of HOMEPAGE_ATTRIBUTES) {
    const id = attrIdsBySlug[def.slug];
    if (!id) continue;

    const isGrid = def.source.startsWith("gridItems.");
    const field = isGrid ? def.source.split(".")[1] : def.source;

    if (def.inputType === "REFERENCE") {
      attributes.push({
        id,
        references: productIds.slice(0, homepage.carouselProductCount),
      });
      continue;
    }

    if (def.inputType === "FILE") {
      const urls = isGrid
        ? homepage.gridItems.map(
            (g) => g[field as keyof (typeof homepage.gridItems)[0]] as string,
          )
        : [homepage[field as keyof typeof homepage] as string];
      fileUploads.push({ attributeId: id, urls });
      continue;
    }

    if (def.inputType === "SWATCH") {
      if (isGrid) {
        for (const g of homepage.gridItems) {
          attributes.push({
            id,
            values: [
              g[field as keyof (typeof homepage.gridItems)[0]] as string,
            ],
          });
        }
      } else {
        attributes.push({
          id,
          values: [homepage[field as keyof typeof homepage] as string],
        });
      }
      continue;
    }

    if (isGrid) {
      for (const g of homepage.gridItems) {
        attributes.push({
          id,
          plainText: g[field as keyof (typeof homepage.gridItems)[0]] as string,
        });
      }
    } else {
      attributes.push({
        id,
        plainText: homepage[field as keyof typeof homepage] as string,
      });
    }
  }

  return { attributes, fileUploads };
}

/**
 * Tests connection to Saleor.
 * @returns Promise<void>
 */
export async function testConnection(): Promise<void> {
  const shopRes = await client.request<ShopQueryResponse>(gql`
    query {
      shop {
        name
      }
    }
  `);
  console.log(`[SEEDING] Connected to shop: ${shopRes.shop.name}`);
}
