import { client } from "./client";
import { HOMEPAGE_ATTRIBUTES } from "./constants";
import { buildPageAttributes, bulkDelete, fetchAllIds } from "./helpers";

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
  FileUploadTask,
  MenuCreateResponse,
  MenuItemCreateResponse,
  MockData,
  PageCreateResponse,
  PageTypeCreateResponse,
  ProductBulkCreateResponse,
  ProductTypeCreateResponse,
} from "./types";
import { gql } from "graphql-request";

const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL;
const SALEOR_APP_TOKEN = process.env.SALEOR_APP_TOKEN;

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

export async function createHomepageAttributes(): Promise<
  Record<string, string>
> {
  console.log("[SEEDING] Creating homepage attributes (bulk)...");

const inputs = HOMEPAGE_ATTRIBUTES.map((attr) => ({
  name: attr.name,
  type: attr.type,
  inputType: attr.inputType,
  entityType: attr.entityType || null,
  values: attr.values || [],
}));

  const res = await client.request<AttributeBulkCreateResponse>(
    ATTRIBUTE_BULK_CREATE_MUTATION,
    { input: inputs },
  );

  const attrIdsBySlug: Record<string, string> = {};

  res.attributeBulkCreate.results.forEach((result, index) => {
    if (result.errors && result.errors.length > 0) {
      console.error(
        `[SEEDING] Failed to create attribute ${HOMEPAGE_ATTRIBUTES[index].name}: ${JSON.stringify(result.errors)}`,
      );
    } else if (result.attribute) {
      attrIdsBySlug[HOMEPAGE_ATTRIBUTES[index].slug] = result.attribute.id;
      console.log(
        `[SEEDING] Created attribute: ${result.attribute.name} (${result.attribute.id})`,
      );
    }
  });

  return attrIdsBySlug;
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
      `[SEEDING] Failed to create Page Type ${name}: ${JSON.stringify(
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
      `[SEEDING] Failed to create page ${title}: ${JSON.stringify(res.pageCreate.errors)}`,
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
      `[SEEDING] Failed to create menu ${name}: ${JSON.stringify(res.menuCreate.errors)}`,
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
      `[SEEDING] Failed to create menu item ${name}: ${JSON.stringify(
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
): Promise<ProductBulkCreateResponse["productBulkCreate"]["results"]> {
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
        `[SEEDING] Failed to create product ${products[index].name}: ${JSON.stringify(result.errors)}`,
      );
    } else if (result.product) {
      console.log(
        `[SEEDING] Created product: ${result.product.name} (${result.product.id})`,
      );
    }
  });

  return res.productBulkCreate.results;
}

export async function createMediaForAllProducts(
  products: ProductBulkCreateResponse["productBulkCreate"]["results"],
  seedProducts: MockData["products"],
): Promise<void> {
  console.log("[SEEDING] Creating media for all products...");

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const photoUrl = seedProducts[i]?.photoUrl;

    if (!photoUrl) {
      console.log(`[SEEDING] Skipping product ${product.product!.name} - no photo URL`);
      continue;
    };

    try {
      console.log(
        `[SEEDING] Downloading image for ${product.product!.name}...`,
      );
      const imageRes = await fetch(photoUrl);
      const buffer = Buffer.from(await imageRes.arrayBuffer());
      const file = new File([buffer], `cover-${i}.jpg`, {
        type: "image/jpeg",
      });

      const query = `
        mutation ProductMediaCreate($productId: ID!, $file: Upload!) {
          productMediaCreate(
            input: {
              product: $productId
              image: $file
              alt: "${product.product!.name} cover"
            }
          ) {
            media {
              id
              url
            }
            errors {
              field
              message
            }
          }
        }
      `;

      const operations = JSON.stringify({
        query,
        variables: {
          productId: product.product!.id,
          file: null,
        },
      });

      const map = JSON.stringify({
        0: ["variables.file"],
      });

      const formData = new FormData();
      formData.append("operations", operations);
      formData.append("map", map);
      formData.append("0", file);

      const response = await fetch(SALEOR_API_URL!, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SALEOR_APP_TOKEN}`,
        },
        body: formData,
      });

      const res = await response.json();
      const errors = res.data?.productMediaCreate?.errors;

      if (errors?.length > 0) {
        console.error(
          `[SEEDING] Failed to create media for ${product.product!.name}: ${JSON.stringify(errors)}`,
        );
      } else if (res.data?.productMediaCreate?.media) {
        console.log(
          `[SEEDING] Added media to product: ${product.product!.name} (${product.product!.id})`,
        );
      }
    } catch (error) {
      console.error(
        `[SEEDING] Request failed for product ${product.product!.name} (${product.product!.id})`,
        error,
      );
    }
  }
}

export async function createHomepagePage(
  pageTypeId: string,
  attrIdsBySlug: Record<string, string>,
  productIds: string[],
  homepage: MockData["homepage"],
): Promise<void> {
  console.log("[SEEDING] Creating homepage page...");

  const { attributes, fileUploads } = buildPageAttributes(
    attrIdsBySlug,
    homepage,
    productIds,
  );

  const pageRes = await client.request(PAGE_CREATE_MUTATION, {
    input: {
      pageType: pageTypeId,
      title: "Homepage",
      slug: "home",
      isPublished: true,
      attributes,
    },
  });

  if (pageRes.pageCreate.errors?.length > 0) {
    console.error("[SEEDING] Failed to create homepage:", pageRes.pageCreate.errors);
    return;
  }

  const pageId = pageRes.pageCreate.page?.id;
  console.log(`[SEEDING] Created homepage page (${pageId})`);

  if (fileUploads.length > 0) {
    await uploadPageFileAttributesGeneric(pageId!, fileUploads);
  }

  console.log("[SEEDING] Homepage setup complete");
}

async function uploadFileAndGetUrl(imageUrl: string): Promise<string> {
  const imageRes = await fetch(imageUrl);
  const buffer = Buffer.from(await imageRes.arrayBuffer());
  const file = new File([buffer], "image.jpg", { type: "image/jpeg" });

  const query = `
    mutation FileUpload($file: Upload!) {
      fileUpload(file: $file) {
        uploadedFile {
          url
          contentType
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const operations = JSON.stringify({
    query,
    variables: { file: null },
  });
  const map = JSON.stringify({ "0": ["variables.file"] });

  const formData = new FormData();
  formData.append("operations", operations);
  formData.append("map", map);
  formData.append("0", file);

  const response = await fetch(SALEOR_API_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${SALEOR_APP_TOKEN}` },
    body: formData,
  });

  const res = await response.json();
  const errors = res.data?.fileUpload?.errors;

  if (errors?.length > 0) {
    throw new Error(`[SEEDING] fileUpload failed: ${JSON.stringify(errors)}`);
  }

  return res.data.fileUpload.uploadedFile.url;
}


async function uploadPageFileAttributesGeneric(
  pageId: string,
  fileUploads: FileUploadTask[],
): Promise<void> {
  console.log("[SEEDING] Uploading file attributes for homepage...");

  const fileAttributes: {
    id: string;
    file: string;
    contentType: string;
  }[] = [];

  for (const task of fileUploads) {
    for (const url of task.urls) {
      const uploadedUrl = await uploadFileAndGetUrl(url);
      console.log(`[SEEDING] Uploaded file: ${uploadedUrl}`);
      fileAttributes.push({
        id: task.attributeId,
        file: uploadedUrl,
        contentType: "image/jpeg",
      });
    }
  }

  const updateQuery = gql`
    mutation PageUpdate($id: ID!, $input: PageInput!) {
      pageUpdate(id: $id, input: $input) {
        page {
          id
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const updateRes = await client.request<{
    pageUpdate: {
      page: { id: string } | null;
      errors: { field: string; message: string }[];
    };
  }>(updateQuery, {
    id: pageId,
    input: { attributes: fileAttributes },
  });

  if (updateRes.pageUpdate.errors.length > 0) {
    throw new Error(
      `[SEEDING] Failed to assign file attributes: ${JSON.stringify(updateRes.pageUpdate.errors)}`,
    );
  }

  console.log("[SEEDING] File attributes assigned successfully");
}
