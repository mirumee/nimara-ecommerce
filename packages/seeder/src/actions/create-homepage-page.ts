import { client } from "../client";
import { buildPageAttributes } from "../helpers";
import { PAGE_CREATE_MUTATION } from "../mutations";
import { MockData } from "../types";
import { uploadPageFileAttributesGeneric } from "./upload-page-file-attributes-generic";

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
