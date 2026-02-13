import { gql } from "graphql-request";

import {
  createCategories,
  createHomepageAttributes,
  createHomepagePage,
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

    // Create homepage attributes
    const attrIdsBySlug = await createHomepageAttributes();

    // Create page types
    const homepagePageTypeId = await createPageType(
  "Homepage",
  Object.values(attrIdsBySlug),
);
    const staticPageTypeId = await createPageType("Static page");

    // Create static pages
    const staticPagesIds = await Promise.all(
      mockData.staticPages.map((page) =>
        createPage(
          page.title,
          page.slug,
          staticPageTypeId,
          page.content,
        ),
      ),
    );

    // Create mock store data foundation
    console.log("[SEEDING] Seeding mock store data foundation...");
    const categoryMap = await createCategories(mockData.categories);
    const productTypeMap = await createProductTypes(
      mockData.productTypes,
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
    await createMediaForAllProducts(products, mockData.products);

    // Create homepage (needs product IDs for carousel)
    const productIds = products.map((p) => p.product!.id);
    await createHomepagePage(
      homepagePageTypeId,
      attrIdsBySlug,
      productIds,
      mockData.homepage,
    );

    // Create menus
    const navbarId = await createMenu("navbar");
    const footerId = await createMenu("footer");

    // Create navbar menu items from categories
    console.log("[SEEDING] Creating navbar menu items...");
    async function createMenuHierarchy(
      categories: any[],
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

    // Create footer menu items from static pages
    console.log("[SEEDING] Creating footer menu items...");
    await Promise.all(
      mockData.staticPages.map(async (page, index) => {
        await createMenuItem(footerId, page.title, {
          pageId: staticPagesIds[index],
        });
      }),
    );

    console.log("[SEEDING] Seeding completed successfully");
  } catch (error) {
    console.error("[SEEDING] Seeding failed:", error);
    process.exit(1);
  }
}

seed();
