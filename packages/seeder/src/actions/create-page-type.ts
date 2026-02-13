import { client } from "../client";
import { PAGE_TYPE_CREATE_MUTATION } from "../mutations";
import { PageTypeCreateResponse } from "../types";

/**
 * Creates a page type.
 * @param name - Name of the page type.
 * @param attributeIds - Array of attribute ids.
 * @returns Id of the created page type.
 */
export async function createPageType(
  name: string,
  attributeIds: string[] = [],
): Promise<string> {
  console.log(`[SEEDING] Creating Page Type: ${name}...`);
  const res = await client.request<PageTypeCreateResponse>(
    PAGE_TYPE_CREATE_MUTATION,
    {
      input: {
        name,
        addAttributes: attributeIds.length > 0 ? attributeIds : undefined,
      },
    },
  );

  if (res.pageTypeCreate.errors.length > 0) {
    throw new Error(
      `[SEEDING] Failed to create Page Type ${name}: ${JSON.stringify(
        res.pageTypeCreate.errors,
      )}`,
    );
  }

  const id = res.pageTypeCreate.pageType!.id;
  console.log(`[SEEDING] Created Page Type: ${name} (${id})`);
  return id;
}
