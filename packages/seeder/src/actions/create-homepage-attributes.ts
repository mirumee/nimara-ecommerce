import { client } from "../client";
import { HOMEPAGE_ATTRIBUTES } from "../constants";
import { ATTRIBUTE_BULK_CREATE_MUTATION } from "../mutations";
import { AttributeBulkCreateResponse } from "../types";

/**
 * Creates homepage attributes.
 * @returns Map of attribute slugs to attribute ids.
 */
export async function createHomepageAttributes(): Promise<
  Record<string, string>
> {
  console.log("[SEEDING] Creating homepage attributes (bulk)...");

const inputs = HOMEPAGE_ATTRIBUTES.map((attr) => ({
  name: attr.name,
  type: attr.type,
  inputType: attr.inputType,
  entityType: attr.entityType || null,
  values: attr.values || [],
}));

  const res = await client.request<AttributeBulkCreateResponse>(
    ATTRIBUTE_BULK_CREATE_MUTATION,
    { input: inputs },
  );

  const attrIdsBySlug: Record<string, string> = {};

  res.attributeBulkCreate.results.forEach((result, index) => {
    if (result.errors && result.errors.length > 0) {
      console.error(
        `[SEEDING] Failed to create attribute ${HOMEPAGE_ATTRIBUTES[index].name}: ${JSON.stringify(result.errors)}`,
      );
    } else if (result.attribute) {
      attrIdsBySlug[HOMEPAGE_ATTRIBUTES[index].slug] = result.attribute.id;
      console.log(
        `[SEEDING] Created attribute: ${result.attribute.name} (${result.attribute.id})`,
      );
    }
  });

  return attrIdsBySlug;
}
