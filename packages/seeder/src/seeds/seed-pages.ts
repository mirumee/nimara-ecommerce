import { createHomepageAttributes } from "../actions/create-homepage-attributes";
import { createPage } from "../actions/create-page";
import { createPageType } from "../actions/create-page-type";
import { MockData } from "../types";
import mockDataRaw from "../mock-data.json";
import { createHomepagePage } from "../actions/create-homepage-page";

const mockData = mockDataRaw as MockData;

/**
 * Seeds the pages - creates homepage and static pages and corresponding page types and attributes.
 * @param productIds - Array of product ids.
 * @returns Object with static page ids and homepage page type id.
 */
export async function seedPages(productIds: string[]): Promise<{ staticPagesIds: string[], homepagePageTypeId: string }> {
        const attrIdsBySlug = await createHomepageAttributes();

        const homepagePageTypeId = await createPageType(
      "Homepage",
      Object.values(attrIdsBySlug),
    );
        const staticPageTypeId = await createPageType("Static page");

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

            await createHomepagePage(
                 homepagePageTypeId,
              attrIdsBySlug,
              productIds,
              mockData.homepage,
            );

        return { staticPagesIds, homepagePageTypeId };
}
