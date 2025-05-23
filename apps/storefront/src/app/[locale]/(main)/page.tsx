import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageType } from "@nimara/domain/objects/CMSPage";

import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { JsonLd, websiteToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { cmsPageService } from "@/services/cms";
import { userService } from "@/services/user";

import { AccountNotifications } from "./_components/account-notifications";
import { HeroBanner } from "./_components/hero-banner";
import { Newsletter } from "./_components/newsletter-form";
import {
  ProductsGrid,
  ProductsGridSkeleton,
} from "./_components/products-grid";

export async function generateMetadata(_params: {
  params: Promise<{}>;
  searchParams: Promise<{}>;
}): Promise<Metadata> {
  const t = await getTranslations("home");

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      images: [
        {
          url: "/og-hp.png",
          width: 1200,
          height: 630,
          alt: t("homepage-preview"),
        },
      ],
    },
  };
}

export default async function Page() {
  const accessToken = await getAccessToken();

  const [region, resultUserGet] = await Promise.all([
    getCurrentRegion(),
    userService.userGet(accessToken),
  ]);

  const user = resultUserGet.ok ? resultUserGet.data : null;

  const resultPage = await cmsPageService.cmsPageGet({
    pageType: PageType.HOMEPAGE,
    slug: "home",
    languageCode: region.language.code,
    options: {
      next: {
        tags: ["CMS:home"],
        revalidate: CACHE_TTL.cms,
      },
    },
  });

  return (
    <section className="grid w-full content-start">
      <HeroBanner fields={resultPage?.data?.fields} />
      <Suspense fallback={<ProductsGridSkeleton />}>
        <ProductsGrid fields={resultPage?.data?.fields} />
      </Suspense>
      <div>
        <AccountNotifications user={user} />
      </div>
      <div className="mb-8">
        <Newsletter />
      </div>
      <JsonLd jsonLd={websiteToJsonLd()} />
    </section>
  );
}
