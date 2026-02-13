import { client } from "../client";
import { PAGE_CREATE_MUTATION } from "../mutations";
import { PageCreateResponse } from "../types";

/**
 * Creates a page.
 * @param title - Title of the page.
 * @param slug - Slug of the page.
 * @param pageTypeId - Id of the page type.
 * @param content - Content of the page.
 * @returns Id of the created page.
 */
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
