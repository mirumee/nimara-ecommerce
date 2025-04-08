import type { MetadataRoute } from "next";

import type { SearchContext } from "@nimara/infrastructure/use-cases/search/types";

import { searchService } from "@/services/search";

type Item = MetadataRoute.Sitemap[number];

const PUBLIC_URL = process.env.BASE_URL ?? "https://www.nimara.store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // TODO: Make this contextual
  const searchContext = {
    currency: "USD",
    channel: "channel-us",
    languageCode: "EN_US",
  } satisfies SearchContext;

  // TODO: Create an exhaustive list of all the routes
  const result = await searchService.search(
    {
      query: "",
      limit: 100,
    },
    searchContext,
  );

  const products = result.ok ? result.data.results : [];
  const productUrls = products.map(
    (product) =>
      ({
        url: `${PUBLIC_URL}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "daily",
        priority: 0.8,
      }) satisfies Item,
  );

  return [
    {
      url: PUBLIC_URL,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
    ...productUrls,
  ];
}
