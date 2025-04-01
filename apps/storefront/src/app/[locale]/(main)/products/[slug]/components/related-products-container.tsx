import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/regions/server";
import { storeService } from "@/services";

import { RelatedProducts } from "./related-products";

export async function RelatedProductsContainer({ slug }: { slug: string }) {
  const region = await getCurrentRegion();

  const serviceOpts = {
    channel: region.market.channel,
    languageCode: region.language.code,
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    countryCode: region.market.countryCode,
  };

  const { data } = await storeService(serviceOpts).getProductDetails({
    productSlug: slug,
    options: {
      next: {
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
      },
    },
  });

  if (!data?.product?.relatedProducts?.length) {
    return null;
  }

  return <RelatedProducts products={data.product.relatedProducts} />;
}
