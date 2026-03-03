import { notFound } from "next/navigation";

import { PageType } from "@nimara/domain/objects/CMSPage";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

export interface CMSPageProviderData {
  content: string | null | undefined;
  title: string | null | undefined;
}

export interface CMSPageProviderProps {
  languageCode: string;
  render: (data: CMSPageProviderData) => React.ReactNode;
  revalidateTime: number;
  services: ServiceRegistry;
  slug: string;
}

export const CMSPageProvider = async ({
  render,
  languageCode,
  slug,
  revalidateTime,
  services,
}: CMSPageProviderProps) => {
  const cmsService = await services.getCMSPageService();
  const resultPage = await cmsService.cmsPageGet({
    pageType: PageType.STATIC_PAGE,
    slug,
    languageCode,
    options: {
      next: {
        tags: [`CMS:${slug}`],
        revalidate: revalidateTime,
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
