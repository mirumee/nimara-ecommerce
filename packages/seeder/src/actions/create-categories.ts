import { client } from "../client";
import { CATEGORY_CREATE_MUTATION } from "../mutations";
import { CategoryCreateResponse, CategoryMock } from "../types";

/**
 * Creates categories recursively.
 * @param categories - Array of category objects.
 * @returns Map of category names to category ids.
 */
export async function createCategories(
  categories: CategoryMock[],
): Promise<Record<string, string>> {
  console.log("[SEEDING] Creating categories...");
  const mapping: Record<string, string> = {};

  async function processCategory(cat: CategoryMock, parentId?: string) {
    const res = await client.request<CategoryCreateResponse>(
      CATEGORY_CREATE_MUTATION,
      {
        input: { name: cat.name, slug: cat.slug },
        parent: parentId,
      },
    );

    if (res.categoryCreate.errors.length > 0) {
      throw new Error(
        `[SEEDING] Failed to create category ${cat.name}: ${JSON.stringify(
          res.categoryCreate.errors,
        )}`,
      );
    }

    const categoryId = res.categoryCreate.category!.id;
    mapping[cat.name] = categoryId;
    console.log(
      `[SEEDING] Created category: ${cat.name}${
        parentId ? ` (parent: ${parentId})` : ""
      }`,
    );

    if (cat.children && cat.children.length > 0) {
      for (const child of cat.children) {
        await processCategory(child, categoryId);
      }
    }
  }

  for (const cat of categories) {
    await processCategory(cat);
  }

  return mapping;
}
