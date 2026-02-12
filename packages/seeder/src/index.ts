import { gql } from "graphql-request";

import {
  createCategories,
  createHomepageAttributes,
  createMediaForAllProducts,
  createMenu,
  createMenuItem,
  createPage,
  createPageType,
  createProducts,
  createProductTypes,
  fetchChannels,
  wipeAllData,
} from "./actions";
import { client } from "./client";
import mockDataRaw from "./mock-data.json";
import { MockData, ShopQueryResponse } from "./types";
import { readFile } from "fs/promises";
import path from "path";

const mockData = mockDataRaw as MockData;

async function seed() {
  console.log("[SEEDING] Starting Saleor seeding...");

  try {
    // Fetch shop info and test connection
    const shopRes = await client.request<ShopQueryResponse>(gql`
      query {
        shop {
          name
        }
      }
    `);
    console.log(`[SEEDING] Connected to shop: ${shopRes.shop.name}`);

    // Wipe all data
    await wipeAllData();

    // Create attributes
    const homepageAttributeIds = await createHomepageAttributes();

    // Create Page Types
    const homepagePageTypeId = await createPageType(
      "Homepage",
      homepageAttributeIds,
    );
    await createPageType("Static page");

    // Create homepage and static pages
    const _homepageId = await createPage("Homepage", "home", homepagePageTypeId);
    const staticPagesIds = await Promise.all(
      mockData.staticPages.map((page) =>
        createPage(page.title, page.slug, homepagePageTypeId, page.content),
      ),
    );

    // Create mock store data foundation
    console.log("[SEEDING] Seeding mock store data foundation...");
    const categoryMap = await createCategories(mockData.categories);
    const productTypeMap = await createProductTypes(mockData.productTypes);

    // Create Menus and Menu Items
    const navbarId = await createMenu("navbar");
    const footerId = await createMenu("footer");

    async function createMenuHierarchy(
      categories: any[],
      parentMenuItemId?: string,
    ) {
      for (const cat of categories) {
        const menuItemId = await createMenuItem(navbarId, cat.name, {
          categoryId: categoryMap[cat.name],
          parent: parentMenuItemId,
        });

        if (cat.children && cat.children.length > 0) {
          await createMenuHierarchy(cat.children, menuItemId);
        }
      }
    }

    console.log("[SEEDING] Creating navbar menu items for categories...");
    await createMenuHierarchy(mockData.categories);

    console.log("[SEEDING] Creating footer menu items for static pages...");
    await Promise.all(
      mockData.staticPages.map(async (page, index) => {
        const menuItemId = await createMenuItem(footerId, page.title, {
          pageId: staticPagesIds[index],
        });
        console.log(
          `[SEEDING] Created footer menu item: ${page.title} (${menuItemId})`,
        );
        return menuItemId;
      }),
    );

    // Fetch default channel
    console.log("[SEEDING] Fetching default channel...");
    const channels = await fetchChannels();
    const defaultChannel =
      channels.find((c) => c.slug === "default-channel") || channels[0];

    if (!defaultChannel) {
      throw new Error("No channel found in Saleor.");
    }

    // Create products in bulk
    const products = await createProducts(
      mockData.products,
      categoryMap,
      productTypeMap,
      defaultChannel.id,
    );

    // Create media for products
    await createMediaForAllProducts(
      products,
      mockData.products,
    );

    console.log("[SEEDING] Seeding completed successfully");
  } catch (error) {
    console.error("[SEEDING] Seeding failed:", error);
    process.exit(1);
  }
}

seed();
