import { client } from "../client";
import { MENU_CREATE_MUTATION } from "../mutations";
import { MenuCreateResponse } from "../types";

/**
 * Creates a menu.
 * @param name - Name of the menu.
 * @returns Id of the created menu.
 */
export async function createMenu(name: string): Promise<string> {
  console.log(`[SEEDING] Creating menu: ${name}...`);
  const res = await client.request<MenuCreateResponse>(MENU_CREATE_MUTATION, {
    input: { name },
  });

  if (res.menuCreate.errors.length > 0) {
    throw new Error(
      `[SEEDING] Failed to create menu ${name}: ${JSON.stringify(res.menuCreate.errors)}`,
    );
  }

  const id = res.menuCreate.menu!.id;
  console.log(`[SEEDING] Created menu: ${name} (${id})`);
  return id;
}
