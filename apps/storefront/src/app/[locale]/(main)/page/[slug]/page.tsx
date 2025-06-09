import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageType } from "@nimara/domain/objects/CMSPage";

import { StaticPage } from "@/components/static-page";
import { CACHE_TTL } from "@/config";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { cmsPageService } from "@/services/cms";

type PageProps = {
  params: Promise<{ locale: SupportedLocale; slug: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;

  const { slug } = params;

  const region = await getCurrentRegion();

  const resultPage = await cmsPageService.cmsPageGet({
    languageCode: region.language.code,
    slug,
    options: {
      next: {
        tags: [`CMS:${slug}`],
        revalidate: CACHE_TTL.cms,
      },
    },
  });

  return {
    title: resultPage?.data?.title,
  };
}

export default async function Page(props: PageProps) {
  const params = await props.params;

  const { slug } = params;

  const region = await getCurrentRegion();

  const resultPage = await cmsPageService.cmsPageGet({
    pageType: PageType.STATIC_PAGE,
    slug,
    languageCode: region.language.code,
    options: {
      next: {
        tags: [`CMS:${slug}`],
        revalidate: CACHE_TTL.cms,
      },
    },
  });

  if (!resultPage.ok) {
    notFound();
  }

  return <StaticPage body={resultPage.data?.content} />;
}
