import { client } from "../client";
import { MENU_ITEM_CREATE_MUTATION } from "../mutations";
import { MenuItemCreateResponse } from "../types";

export async function createMenuItem(
  menuId: string,
  name: string,
  link: { categoryId?: string; pageId?: string; url?: string; parent?: string },
): Promise<string> {
  console.log(`[SEEDING] Creating menu item: ${name}...`);
  const res = await client.request<MenuItemCreateResponse>(
    MENU_ITEM_CREATE_MUTATION,
    {
      input: {
        menu: menuId,
        name,
        category: link.categoryId,
        page: link.pageId,
        url: link.url,
        parent: link.parent,
      },
    },
  );

  if (res.menuItemCreate.errors.length > 0) {
    throw new Error(
      `[SEEDING] Failed to create menu item ${name}: ${JSON.stringify(
        res.menuItemCreate.errors,
      )}`,
    );
  }

  const id = res.menuItemCreate.menuItem!.id;
  console.log(`[SEEDING] Created menu item: ${name} (${id})`);
  return id;
}
