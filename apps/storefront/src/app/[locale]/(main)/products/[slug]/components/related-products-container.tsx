import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/regions/server";
import { storeService } from "@/services";
import { storefrontLogger } from "@/services/logging";

import { RelatedProducts } from "./related-products";

export const RelatedProductsContainer = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const region = await getCurrentRegion();

  const serviceOpts = {
    channel: region.market.channel,
    languageCode: region.language.code,
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    countryCode: region.market.countryCode,
    logger: storefrontLogger,
  };

  const { products } = await storeService(
    serviceOpts,
  ).getProductRelatedProducts({
    productSlug: slug,
    options: {
      next: {
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
      },
    },
  });

  if (!products?.length) {
    return null;
  }

  return <RelatedProducts products={products} />;
};
