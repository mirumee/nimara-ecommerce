import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageType } from "@nimara/domain/objects/CMSPage";

import { StaticPage } from "@/components/static-page";
import { CACHE_TTL } from "@/config";
import { getCurrentRegion } from "@/regions/server";
import { cmsPageService } from "@/services/cms";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { slug } = params;

  const region = await getCurrentRegion();

  const page = await cmsPageService.cmsPageGet({
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
    title: page?.title,
  };
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;

  const { slug } = params;

  const region = await getCurrentRegion();

  const page = await cmsPageService.cmsPageGet({
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

  if (!page) {
    notFound();
  }

  return <StaticPage body={page.content} />;
}
