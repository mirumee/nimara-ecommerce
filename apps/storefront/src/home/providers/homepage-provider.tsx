import { type CMSPage, PageType } from "@nimara/domain/objects/CMSPage";

import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { AccountNotifications } from "@/home/components/account-notifications";
import { JsonLd, websiteToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { cmsPageService } from "@/services/cms";
import { getUserService } from "@/services/user";

export const HomepageProvider = async ({
  render,
}: {
  render: (cmsData: CMSPage | null) => React.ReactNode;
}) => {
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
    <>
      {render(resultPage.data ?? null)}

      <AccountNotifications user={user} />
      <JsonLd jsonLd={websiteToJsonLd()} />
    </>
  );
};
