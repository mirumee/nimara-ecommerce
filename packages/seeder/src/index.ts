import { gql } from "graphql-request";

import {
  createCategories,
  createHomepageAttributes,
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

    // Create Pages
    const homepageId = await createPage("Homepage", "home", homepagePageTypeId);
    const aboutPageId = await createPage(
      "About usability",
      "about",
      homepagePageTypeId,
    );

    // Create mock store data foundation
    console.log("[SEEDING] Seeding mock store data foundation...");
    const categoryMap = await createCategories(mockData.categories);
    const productTypeMap = await createProductTypes(mockData.productTypes);

    // Create Menus and Menu Items
    const navbarId = await createMenu("navbar");
    const footerId = await createMenu("footer");

    // Navbar items
    await createMenuItem(navbarId, "Home", { pageId: homepageId });

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

    await createMenuHierarchy(mockData.categories);

    // Footer items
    await createMenuItem(footerId, "About", { pageId: aboutPageId });
    await createMenuItem(footerId, "GitHub", {
      url: "https://github.com/mirumee/nimara-ecommerce",
    });

    // Seed Products
    console.log("[SEEDING] Seeding products...");
    const channels = await fetchChannels();
    const defaultChannel =
      channels.find((c) => c.slug === "default-channel") || channels[0];

    if (!defaultChannel) {
      throw new Error("No channel found in Saleor.");
    }

    await createProducts(
      mockData.products,
      categoryMap,
      productTypeMap,
      defaultChannel.id,
    );

    console.log("[SEEDING] Seeding completed successfully");
  } catch (error) {
    console.error("[SEEDING] Seeding failed:", error);
    process.exit(1);
  }
}

seed();
