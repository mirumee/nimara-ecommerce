import { notFound } from "next/navigation";

import { PageType } from "@nimara/domain/objects/CMSPage";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

export interface CMSPageProviderData {
  content: string | null | undefined;
  title: string | null | undefined;
}

export interface CMSPageProviderProps {
  render: (data: CMSPageProviderData) => React.ReactNode;
  services: ServiceRegistry;
  slug: string;
}

export const CMSPageProvider = async ({
  render,
  slug,
  services,
}: CMSPageProviderProps) => {
  const resultPage = await services.cms.cmsPageGet({
    pageType: PageType.STATIC_PAGE,
    slug,
    languageCode: services.region.language.code,
    options: {
      next: {
        tags: [`CMS:${slug}`],
        revalidate: services.config.cacheTTL.cms,
      },
    },
  });

  if (!resultPage.ok) {
    return notFound();
  }

  return (
    <>
      {render({
        content: resultPage.data?.content,
        title: resultPage.data?.title,
      })}
    </>
  );
};
