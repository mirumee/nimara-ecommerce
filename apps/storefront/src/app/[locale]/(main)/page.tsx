import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageType } from "@nimara/domain/objects/CMSPage";

import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { JsonLd, websiteToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { cmsPageService } from "@/services/cms";
import { getUserService } from "@/services/user";

import { AccountNotifications } from "./_components/account-notifications";
import { HeroBanner } from "./_components/hero-banner";
import { Newsletter } from "./_components/newsletter-form";
import {
  ProductsGrid,
  ProductsGridSkeleton,
} from "./_components/products-grid";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
  searchParams: Promise<Record<string, string>>;
};

export async function generateMetadata(_params: PageProps): Promise<Metadata> {
  const t = await getTranslations("home");

  const url = new URL(clientEnvs.NEXT_PUBLIC_STOREFRONT_URL);
  const canonicalUrl = url.toString();

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
      url: canonicalUrl,
      siteName: "Nimara Store",
    },
  };
}

export default async function Page() {
  const [accessToken, region, userService] = await Promise.all([
    getAccessToken(),
    getCurrentRegion(),
    getUserService(),
  ]);

  const resultUserGet = await userService.userGet(accessToken);

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
