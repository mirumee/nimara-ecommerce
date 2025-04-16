import { Suspense } from "react";

import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/regions/server";
import { storeService } from "@/services";
import { storefrontLogger } from "@/services/logging";

import { ProductDetailsContainer } from "./components/product-details-container";
import { ProductDetailsSkeleton } from "./components/product-details-skeleton";
import { RelatedProductsContainer } from "./components/related-products-container";
import { RelatedProductsSkeleton } from "./components/related-products-skeleton";

export const experimental_ppr = true;

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const params = await props.params;
  const { slug } = params;
  const region = await getCurrentRegion();

  const serviceOpts = {
    channel: region.market.channel,
    languageCode: region.language.code,
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    countryCode: region.market.countryCode,
    logger: storefrontLogger,
  };

  const result = await storeService(serviceOpts).getProductBase({
    productSlug: slug,
    options: {
      next: {
        revalidate: CACHE_TTL.pdp,
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
      },
    },
  });

  return {
    title: result?.data?.product?.name,
    description: result?.data?.product?.description,
  };
}

export default function Page(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  return (
    <div className="relative w-full">
      <Suspense fallback={<ProductDetailsSkeleton />}>
        <ProductDetailsContainer params={props.params} />
      </Suspense>
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProductsContainer params={props.params} />
      </Suspense>
    </div>
  );
}
