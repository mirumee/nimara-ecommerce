import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageType } from "@nimara/domain/objects/CMSPage";

import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { JsonLd, websiteToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { userService } from "@/services";
import { cmsPageService } from "@/services/cms";

import { AccountNotifications } from "./_components/account-notifications";
import { HeroBanner } from "./_components/hero-banner";
import { ProductsGrid } from "./_components/products-grid";

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

  const [region, user] = await Promise.all([
    getCurrentRegion(),
    userService.userGet(accessToken),
  ]);

  const page = await cmsPageService.cmsPageGet({
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
      <HeroBanner fields={page?.fields} />
      <ProductsGrid fields={page?.fields} />
      <div>
        <AccountNotifications user={user} />
      </div>
      <JsonLd jsonLd={websiteToJsonLd()} />
    </section>
  );
}
