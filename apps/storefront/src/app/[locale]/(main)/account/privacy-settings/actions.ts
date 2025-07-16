"use server";

import { getLocale } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { getStoreUrl, getStoreUrlWithPath } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { getUserService } from "@/services/user";

export async function requestUserAccountDeletion() {
  const [storeUrl, region, locale, accessToken, userService] =
    await Promise.all([
      getStoreUrl(),
      getCurrentRegion(),
      getLocale(),
      getAccessToken(),
      getUserService(),
    ]);

  const result = await userService.accountRequestDeletion({
    channel: region.market.channel,
    redirectUrl: getStoreUrlWithPath(storeUrl, paths.deleteAccount.asPath()),
    accessToken,
  });

  if (!result.ok) {
    redirect({
      href: paths.account.privacySettings.asPath({ query: { error: "true" } }),
      locale,
    });
  }

  redirect({
    href: paths.account.privacySettings.asPath({
      query: { emailSent: "true" },
    }),
    locale,
  });
}
