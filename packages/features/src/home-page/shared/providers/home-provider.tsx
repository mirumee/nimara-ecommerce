import { type PageField, PageType } from "@nimara/domain/objects/CMSPage";
import type { User } from "@nimara/domain/objects/User";
import { JsonLd, websiteToJsonLd } from "@nimara/features/json-ld/json-ld";
import { type Region } from "@nimara/foundation/regions/types";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

export interface HomeProviderData {
  fields: PageField[] | undefined;
  user: User | null;
}

export interface HomeProviderProps {
  accessToken: string | null;
  region: Region;
  render: (data: HomeProviderData) => React.ReactNode;
  revalidateTime: number;
  services: ServiceRegistry;
}

export const HomeProvider = async ({
  render,
  region,
  services,
  accessToken,
  revalidateTime,
}: HomeProviderProps) => {
  const [userService, cmsService] = await Promise.all([
    services.getUserService(),
    services.getCMSPageService(),
  ]);
  const [resultUserGet, resultPage] = await Promise.all([
    accessToken
      ? userService.userGet(accessToken)
      : { ok: false as const, errors: [], data: null },
    cmsService.cmsPageGet({
      pageType: PageType.HOMEPAGE,
      slug: "home",
      languageCode: region.language.code,
      options: {
        next: {
          tags: ["CMS:home"],
          revalidate: revalidateTime,
        },
      },
    }),
  ]);

  const user = resultUserGet.ok ? resultUserGet.data : null;
  const fields = resultPage?.data?.fields;

  return (
    <>
      {render({ user, fields })}
      <JsonLd jsonLd={websiteToJsonLd()} />
    </>
  );
};
