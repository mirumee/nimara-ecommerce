import { type PageField, PageType } from "@nimara/domain/objects/CMSPage";
import type { User } from "@nimara/domain/objects/User";
import { JsonLd, websiteToJsonLd } from "@nimara/features/json-ld/json-ld";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

export interface HomeProviderData {
  fields: PageField[] | undefined;
  user: User | null;
}

export interface HomeProviderProps {
  accessToken: string | null;
  render: (data: HomeProviderData) => React.ReactNode;
  services: ServiceRegistry;
}

export const HomeProvider = async ({
  render,
  services,
  accessToken,
}: HomeProviderProps) => {
  const [resultUserGet, resultPage] = await Promise.all([
    accessToken
      ? services.user.userGet(accessToken)
      : { ok: false as const, errors: [], data: null },
    services.cms.cmsPageGet({
      pageType: PageType.HOMEPAGE,
      slug: "home",
      languageCode: services.region.language.code,
      options: {
        next: {
          tags: ["CMS:home"],
          revalidate: services.config.cacheTTL.cms,
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
