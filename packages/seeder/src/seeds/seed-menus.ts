import { createMenu } from "../actions/create-menu";
import { createMenuItem } from "../actions/create-menu-item";
import mockDataRaw from "../mock-data.json";
import { CategoryMock, MockData } from "../types";

const mockData = mockDataRaw as MockData;

/**
 * Seeds the menus - creates navbar and footer and corresponding menu items.
 * @param categoryMap - Map of category names to category ids.
 * @param staticPagesIds - Array of static page ids.
 */
export async function seedMenus(
  categoryMap: Record<string, string>,
  staticPagesIds: string[],
) {
  const navbarId = await createMenu("navbar");
  const footerId = await createMenu("footer");

  console.log("[SEEDING] Creating navbar menu items...");
  async function createMenuHierarchy(
    categories: CategoryMock[],
    parentMenuItemId?: string,
  ) {
    for (const cat of categories) {
      const menuItemId = await createMenuItem(navbarId, cat.name, {
        categoryId: categoryMap[cat.name],
        parent: parentMenuItemId,
      });

      if (cat.children?.length > 0) {
        await createMenuHierarchy(cat.children, menuItemId);
      }
    }
  }
  await createMenuHierarchy(mockData.categories);

  console.log("[SEEDING] Creating footer menu items...");
  await Promise.all(
    mockData.staticPages.map(async (page, index) => {
      await createMenuItem(footerId, page.title, {
        pageId: staticPagesIds[index],
      });
    }),
  );
}
