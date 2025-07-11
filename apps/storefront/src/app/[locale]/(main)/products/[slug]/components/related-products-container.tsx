import { CACHE_TTL } from "@/config";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { lazyLoadService } from "@/services/import";

import { RelatedProducts } from "./related-products";

type PageProps = {
  params: Promise<{ locale: SupportedLocale; slug: string }>;
};

export const RelatedProductsContainer = async ({ params }: PageProps) => {
  const [{ slug }, region, storeService] = await Promise.all([
    params,
    getCurrentRegion(),
    lazyLoadService("STORE"),
  ]);

  const result = await storeService.getProductRelatedProducts({
    productSlug: slug,
    channel: region.market.channel,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    options: {
      next: {
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
        revalidate: CACHE_TTL.pdp,
      },
    },
  });

  if (!result?.data?.products?.length) {
    return null;
  }

  return <RelatedProducts products={result.data.products} />;
};
