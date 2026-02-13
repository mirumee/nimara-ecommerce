import { bulkDelete, fetchAllIds } from "../helpers";
import { ATTRIBUTE_BULK_DELETE_MUTATION, CATEGORY_BULK_DELETE_MUTATION, MENU_BULK_DELETE_MUTATION, PAGE_BULK_DELETE_MUTATION, PAGE_TYPE_BULK_DELETE_MUTATION, PRODUCT_BULK_DELETE_MUTATION, PRODUCT_TYPE_BULK_DELETE_MUTATION } from "../mutations";

/**
 * Wipes all data from the database.
 */
export async function wipeAllData(): Promise<void> {
  console.log("[SEEDING] Wiping all data...");

  const entities: [string, string][] = [
    ["pages", PAGE_BULK_DELETE_MUTATION],
    ["pageTypes", PAGE_TYPE_BULK_DELETE_MUTATION],
    ["products", PRODUCT_BULK_DELETE_MUTATION],
    ["productTypes", PRODUCT_TYPE_BULK_DELETE_MUTATION],
    ["categories", CATEGORY_BULK_DELETE_MUTATION],
    ["attributes", ATTRIBUTE_BULK_DELETE_MUTATION],
    ["menus", MENU_BULK_DELETE_MUTATION],
  ];

  for (const [field, mutation] of entities) {
    const ids = await fetchAllIds(field);
    await bulkDelete(field, ids, mutation);
  }

  console.log("[SEEDING] Data wipe completed.");
}
