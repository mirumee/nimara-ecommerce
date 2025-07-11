import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { editorJSDataToString } from "@nimara/ui/lib/richText";

import { InViewAnimator } from "@/components/in-view";
import { CACHE_TTL } from "@/config";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { lazyLoadService } from "@/services/import";

import { ProductDetailsContainer } from "./components/product-details-container";
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
    lazyLoadService("STORE"),
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

  const rawDescription = result?.data?.product?.description;
  const parsedDescription = editorJSDataToString(rawDescription)?.trim();

  const fallbackDescription = result?.data?.product?.name
    ? t("check-out-the-product", { productName: result?.data?.product?.name })
    : t("discover-our-product");

  return {
    title: result?.data?.product?.name,
    description: parsedDescription?.length
      ? parsedDescription.slice(0, 200)
      : fallbackDescription,
  };
}

export default function Page(props: PageProps) {
  return (
    <div className="relative w-full">
      <ProductDetailsContainer params={props.params} />

      <InViewAnimator>
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProductsContainer params={props.params} />
        </Suspense>
      </InViewAnimator>
    </div>
  );
}
