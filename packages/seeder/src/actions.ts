import { client } from "./client";
import { HOMEPAGE_ATTRIBUTES } from "./constants";
import { bulkDelete, fetchAllIds } from "./helpers";

import {
  ATTRIBUTE_BULK_CREATE_MUTATION,
  ATTRIBUTE_BULK_DELETE_MUTATION,
  CATEGORY_BULK_DELETE_MUTATION,
  CATEGORY_CREATE_MUTATION,
  MENU_BULK_DELETE_MUTATION,
  MENU_CREATE_MUTATION,
  MENU_ITEM_CREATE_MUTATION,
  PAGE_BULK_DELETE_MUTATION,
  PAGE_CREATE_MUTATION,
  PAGE_TYPE_BULK_DELETE_MUTATION,
  PAGE_TYPE_CREATE_MUTATION,
  PRODUCT_BULK_CREATE_MUTATION,
  PRODUCT_BULK_DELETE_MUTATION,
  PRODUCT_TYPE_BULK_DELETE_MUTATION,
  PRODUCT_TYPE_CREATE_MUTATION,
} from "./mutations";
import {
  AttributeBulkCreateResponse,
  CategoryCreateResponse,
  ChannelNode,
  ChannelsQueryResponse,
  MenuCreateResponse,
  MenuItemCreateResponse,
  MockData,
  PageCreateResponse,
  PageTypeCreateResponse,
  ProductBulkCreateResponse,
  ProductTypeCreateResponse,
} from "./types";
import { gql } from "graphql-request";

export async function wipeAllData(): Promise<void> {
  console.log("[SEEDING] Wiping all data...");

  // Order matters for FK constraints
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

export async function createHomepageAttributes(): Promise<string[]> {
  console.log("[SEEDING] Creating homepage attributes (bulk)...");

  const inputs = HOMEPAGE_ATTRIBUTES.map(attr => ({
    name: attr.name,
    type: attr.type,
    inputType: attr.inputType,
    entityType: attr.entityType || null,
  }));

  const res = await client.request<AttributeBulkCreateResponse>(
    ATTRIBUTE_BULK_CREATE_MUTATION,
    { input: inputs }
  );

  const ids: string[] = [];
  res.attributeBulkCreate.results.forEach((result, index) => {
    if (result.errors && result.errors.length > 0) {
      console.error(`Failed to create attribute ${HOMEPAGE_ATTRIBUTES[index].name}: ${JSON.stringify(result.errors)}`);
    } else if (result.attribute) {
      ids.push(result.attribute.id);
      console.log(`[SEEDING] Created attribute: ${result.attribute.name} (${result.attribute.id})`);
    }
  });

  return ids;
}

export async function createPageType(
  name: string,
  attributeIds: string[] = [],
): Promise<string> {
  console.log(`[SEEDING] Creating Page Type: ${name}...`);
  const res = await client.request<PageTypeCreateResponse>(
    PAGE_TYPE_CREATE_MUTATION,
    {
      input: {
        name,
        addAttributes: attributeIds.length > 0 ? attributeIds : undefined,
      },
    },
  );

  if (res.pageTypeCreate.errors.length > 0) {
    throw new Error(
      `Failed to create Page Type ${name}: ${JSON.stringify(
        res.pageTypeCreate.errors,
      )}`,
    );
  }

  const id = res.pageTypeCreate.pageType!.id;
  console.log(`[SEEDING] Created Page Type: ${name} (${id})`);
  return id;
}

export async function createPage(
  title: string,
  slug: string,
  pageTypeId: string,
  content?: string,
): Promise<string> {
  console.log(`[SEEDING] Creating page: ${title}...`);

    const editorJsContent = content
    ? JSON.stringify({
        blocks: [
          {
            type: "paragraph",
            data: { text: content },
          },
        ],
      })
    : undefined;

  const res = await client.request<PageCreateResponse>(PAGE_CREATE_MUTATION, {
    input: {
      title,
      slug,
      pageType: pageTypeId,
      isPublished: true,
      content: editorJsContent,
    },
  });

  if (res.pageCreate.errors.length > 0) {
    throw new Error(
      `Failed to create page ${title}: ${JSON.stringify(res.pageCreate.errors)}`,
    );
  }

  const id = res.pageCreate.page!.id;
  console.log(`[SEEDING] Created page instance: ${title} (${id})`);
  return id;
}

export async function createMenu(name: string): Promise<string> {
  console.log(`[SEEDING] Creating menu: ${name}...`);
  const res = await client.request<MenuCreateResponse>(MENU_CREATE_MUTATION, {
    input: { name },
  });

  if (res.menuCreate.errors.length > 0) {
    throw new Error(
      `Failed to create menu ${name}: ${JSON.stringify(res.menuCreate.errors)}`,
    );
  }

  const id = res.menuCreate.menu!.id;
  console.log(`[SEEDING] Created menu: ${name} (${id})`);
  return id;
}

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
      `Failed to create menu item ${name}: ${JSON.stringify(
        res.menuItemCreate.errors,
      )}`,
    );
  }

  const id = res.menuItemCreate.menuItem!.id;
  console.log(`[SEEDING] Created menu item: ${name} (${id})`);
  return id;
}

export async function createCategories(
  categories: MockData["categories"],
): Promise<Record<string, string>> {
  console.log("[SEEDING] Creating categories...");
  const mapping: Record<string, string> = {};

  async function processCategory(cat: any, parentId?: string) {
    const res = await client.request<CategoryCreateResponse>(
      CATEGORY_CREATE_MUTATION,
      {
        input: { name: cat.name, slug: cat.slug },
        parent: parentId
      },
    );

    if (res.categoryCreate.errors.length > 0) {
      throw new Error(
        `Failed to create category ${cat.name}: ${JSON.stringify(
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

export async function createProductTypes(
  productTypes: MockData["productTypes"],
): Promise<Record<string, string>> {
  console.log("[SEEDING] Creating product types...");
  const mapping: Record<string, string> = {};

  for (const pt of productTypes) {
    const res = await client.request<ProductTypeCreateResponse>(
      PRODUCT_TYPE_CREATE_MUTATION,
      {
        input: {
          name: pt.name,
          hasVariants: pt.hasVariants,
          isShippingRequired: pt.isShippingRequired,
        },
      },
    );
    if (res.productTypeCreate.errors.length > 0) {
      throw new Error(
        `[SEEDING] Failed to create product type ${pt.name}: ${JSON.stringify(
          res.productTypeCreate.errors,
        )}`,
      );
    }
    mapping[pt.name] = res.productTypeCreate.productType!.id;
    console.log(`[SEEDING] Created product type: ${pt.name}`);
  }
  return mapping;
}

export async function fetchChannels(): Promise<ChannelNode[]> {
  const query = gql`
    query {
      channels {
        id
        slug
      }
    }
  `;
  const res = await client.request<ChannelsQueryResponse>(query);
  return res.channels;
}

export async function createProducts(
  products: MockData["products"],
  categoryMap: Record<string, string>,
  productTypeMap: Record<string, string>,
  channelId: string,
): Promise<void> {
  console.log("[SEEDING] Creating products in bulk...");

  const inputs = products.map((p) => ({
    name: p.name,
    category: categoryMap[p.category],
    productType: productTypeMap[p.productType],
    description: JSON.stringify({
      time: 123,
      blocks: [{ type: "paragraph", data: { text: p.description } }],
      version: "2.20.0",
    }),
    variants: p.variants
      ? p.variants.map((v) => ({
          sku: v.sku,
          name: v.name,
          attributes: [],
          channelListings: [
            {
              channelId,
              price: v.price.toString(),
            },
          ],
        }))
      : [
          {
            sku: p.sku,
            name: "Standard",
            attributes: [],
            channelListings: [
              {
                channelId,
                price: p.price!.toString(),
              },
            ],
          },
        ],
    channelListings: [
      {
        channelId,
        isPublished: true,
        isAvailableForPurchase: true,
        visibleInListings: true,
      },
    ],
  }));

  const res = await client.request<ProductBulkCreateResponse>(
    PRODUCT_BULK_CREATE_MUTATION,
    { input: inputs },
  );

  res.productBulkCreate.results.forEach((result, index) => {
    if (result.errors && result.errors.length > 0) {
      console.error(
        `Failed to create product ${products[index].name}: ${JSON.stringify(result.errors)}`,
      );
    } else if (result.product) {
      console.log(
        `[SEEDING] Created product: ${result.product.name} (${result.product.id})`,
      );
    }
  });
}
