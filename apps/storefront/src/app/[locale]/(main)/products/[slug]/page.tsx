import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { CACHE_TTL } from "@/config";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { getStoreService } from "@/services/store";

import { ProductDetailsContainer } from "./components/product-details-container";
import { ProductDetailsSkeleton } from "./components/product-details-skeleton";
import { RelatedProductsContainer } from "./components/related-products-container";
import { RelatedProductsSkeleton } from "./components/related-products-skeleton";

type PageProps = {
  params: Promise<{ locale: SupportedLocale; slug: string }>;
};

export async function generateMetadata(props: PageProps) {
  const [{ slug }, region, t, storeService] = await Promise.all([
    props.params,
    getCurrentRegion(),
    getTranslations("products"),
    getStoreService(),
  ]);

  const result = await storeService.getProductBase({
    productSlug: slug,
    channel: region.market.channel,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    options: {
      next: {
        revalidate: CACHE_TTL.pdp,
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
      },
    },
  });

  if (!result.data?.product) {
    return;
  }

  const fallbackDescription = result?.data?.product?.name
    ? t("check-out-the-product", { productName: result?.data?.product?.name })
    : t("discover-our-product");

  return {
    title: result.data.product.seo.title || result.data.product.name,
    description: result.data?.product?.seo.description ?? fallbackDescription,
  };
}

export default function Page(props: PageProps) {
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
