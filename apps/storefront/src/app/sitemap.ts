import type { MetadataRoute } from "next";

import type { SearchContext } from "@nimara/infrastructure/use-cases/search/types";

import { searchService } from "@/services/search";

type Item = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const searchContext = {
    currency: "USD",
    channel: "channel-us",
    languageCode: "EN_US",
  } satisfies SearchContext;

  const { results } = await searchService.search(
    {
      query: "",
      limit: 100,
    },
    searchContext,
  );

  const publicUrl = process.env.BASE_URL;
  const productUrls = results.map(
    (product) =>
      ({
        url: `${publicUrl}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "daily",
        priority: 0.8,
      }) satisfies Item,
  );

  return [
    {
      url: publicUrl ?? "https://www.nimara.store",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
    ...productUrls,
  ];
}
