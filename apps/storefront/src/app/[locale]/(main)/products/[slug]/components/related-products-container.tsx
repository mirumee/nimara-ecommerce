import { CACHE_TTL } from "@/config";
import { getCurrentRegion } from "@/regions/server";
import { getStoreService } from "@/services/store";

import { RelatedProducts } from "./related-products";

type Props = {
  slug: string;
};

export const RelatedProductsContainer = async ({ slug }: Props) => {
  const [region, storeService] = await Promise.all([
    getCurrentRegion(),
    getStoreService(),
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
