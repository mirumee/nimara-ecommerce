import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { JsonLd, websiteToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { cmsPageService, userService } from "@/services";

import { AccountNotifications } from "./_components/account-notifications";
import { HeroBanner } from "./_components/hero-banner";
import { ProductsGrid } from "./_components/products-grid";

export async function generateMetadata(_params: {
  params: {};
  searchParams: {};
}): Promise<Metadata> {
  const t = await getTranslations("home");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function Page() {
  const accessToken = getAccessToken();

  const [region, user] = await Promise.all([
    getCurrentRegion(),
    userService.userGet(accessToken),
  ]);

  const page = await cmsPageService.cmsPageGet({
    languageCode: region.language.code,
    slug: "home",
    options: {
      next: {
        tags: ["CMS:home"],
        revalidate: CACHE_TTL.cms,
      },
    },
  });

  return (
    <section className="grid w-full content-start">
      <HeroBanner attributes={page?.attributes} />
      <ProductsGrid attributes={page?.attributes} />
      <div>
        <AccountNotifications user={user} />
      </div>
      <JsonLd jsonLd={websiteToJsonLd()} />
    </section>
  );
}
