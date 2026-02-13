import { wipeAllData } from "./actions/wipe-all-data";
import { testConnection } from "./helpers";
import { seedPages } from "./seeds/seed-pages";
import { seedProducts } from "./seeds/seed-products";
import { seedMenus } from "./seeds/seed-menus";

async function seed() {
  console.log("[SEEDING] Starting Saleor seeding...");

  try {

    // Test connection
    await testConnection();

    // Wipe all data
    await wipeAllData();

    // Seed data
    const { productIds, categoryMap } = await seedProducts();
    const { staticPagesIds } = await seedPages(productIds);
    await seedMenus(categoryMap, staticPagesIds)

    console.log("[SEEDING] Seeding completed successfully");
  } catch (error) {
    console.error("[SEEDING] Seeding failed:", error);
    process.exit(1);
  }
}

seed();
