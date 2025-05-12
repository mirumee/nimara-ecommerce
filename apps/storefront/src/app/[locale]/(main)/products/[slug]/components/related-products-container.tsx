import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/regions/server";
import { storeService } from "@/services";
import { storefrontLogger } from "@/services/logging";
import { type PreviousPage } from "@/types";

import { RelatedProducts } from "./related-products";

export const RelatedProductsContainer = async ({
  params,
  previousPage,
}: {
  params: Promise<{ locale: string; slug: string }>;
  previousPage: PreviousPage;
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

  const result = await storeService(serviceOpts).getProductRelatedProducts({
    productSlug: slug,
    options: {
      next: {
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
      },
    },
  });

  if (!result?.data?.products?.length) {
    return null;
  }

  return (
    <RelatedProducts
      products={result.data.products}
      previousPage={previousPage}
    />
  );
};
