import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { storefrontLogger } from "@/services/logging";
import { storeService } from "@/services/store";

import { RelatedProducts } from "./related-products";

type PageProps = {
  params: Promise<{ locale: SupportedLocale; slug: string }>;
};

export const RelatedProductsContainer = async ({ params }: PageProps) => {
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
        revalidate: CACHE_TTL.pdp,
      },
    },
  });

  if (!result?.data?.products?.length) {
    return null;
  }

  return <RelatedProducts products={result.data.products} />;
};
