import { ImageResponse } from "next/og";

import type { SearchContext } from "@nimara/infrastructure/use-cases/search/types";

import { CACHE_TTL } from "@/config";
import { getCurrentRegion } from "@/regions/server";
import { cmsPageService } from "@/services";
import { searchService } from "@/services/search";

export const size = {
  width: 1200,
  height: 630,
};

export const runtime = "edge";

export const contentType = "image/png";
export const alt = "Homepage preview";

// eslint-disable-next-line import/no-default-export
export default async function Image() {
  const region = await getCurrentRegion();

  const searchContext = {
    currency: region.market.currency,
    channel: region.market.channel,
    languageCode: region.language.code,
  } satisfies SearchContext;

  const page = await cmsPageService.cmsPageGet({
    languageCode: region.language.code,
    slug: "home",
    options: {
      next: {
        tags: ["CMS:home"],
        revalidate: CACHE_TTL.cms,
      },
    },
  });

  const bannerProductId = page?.attributes.find(
    (attr) => attr.slug === "homepage-banner-image",
  )?.values[0]?.reference as string;

  const { results: products } = await searchService.search(
    {
      productIds: [bannerProductId],
      limit: 1,
    },
    searchContext,
  );

  if (!products) {
    return null;
  }

  return new ImageResponse(
    (
      <div tw="flex w-full h-full items-center justify-center bg-neutral-100">
        <div
          style={{
            backgroundImage: `url(${products[0]?.media?.[0]?.url})`,
            backgroundSize: "100% 100%",
            height: "100%",
            width: "100%",
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
