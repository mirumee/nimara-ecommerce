"use server";

import { getLocale } from "next-intl/server";

import { redirect } from "@nimara/i18n/routing";

import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getStoreUrl, getStoreUrlWithPath } from "@/foundation/server";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

export async function requestUserAccountDeletion() {
  const [storeUrl, region, locale, accessToken, services] = await Promise.all([
    getStoreUrl(),
    getCurrentRegion(),
    getLocale(),
    getAccessToken(),
    getServiceRegistry(),
  ]);
  const userService = await services.getUserService();

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
