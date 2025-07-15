import type { MetadataRoute } from "next";

import type { SearchContext } from "@nimara/infrastructure/use-cases/search/types";

import { clientEnvs } from "@/envs/client";
import { getSearchService } from "@/services/search";

type Item = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // TODO: Make this contextual
  const searchContext = {
    currency: "USD",
    channel: "channel-us",
    languageCode: "EN_US",
  } satisfies SearchContext;

  const searchService = await getSearchService();
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
        url: new URL(
          `/products/${product.slug}`,
          clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
        ).toString(),
        lastModified: product.updatedAt,
        changeFrequency: "daily",
        priority: 0.8,
      }) satisfies Item,
  );

  return [
    {
      url: clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
    ...productUrls,
  ];
}
