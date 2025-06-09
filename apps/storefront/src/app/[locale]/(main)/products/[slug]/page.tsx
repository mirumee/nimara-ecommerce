import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { editorJSDataToString } from "@nimara/ui/lib/richText";

import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { storefrontLogger } from "@/services/logging";
import { storeService } from "@/services/store";

import { ProductDetailsContainer } from "./components/product-details-container";
import { ProductDetailsSkeleton } from "./components/product-details-skeleton";
import { RelatedProductsContainer } from "./components/related-products-container";
import { RelatedProductsSkeleton } from "./components/related-products-skeleton";

type PageProps = {
  params: Promise<{ locale: SupportedLocale; slug: string }>;
};

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const region = await getCurrentRegion();
  const t = await getTranslations("products");

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
      <Suspense fallback={<ProductDetailsSkeleton />}>
        <ProductDetailsContainer params={props.params} />
      </Suspense>
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProductsContainer params={props.params} />
      </Suspense>
    </div>
  );
}
