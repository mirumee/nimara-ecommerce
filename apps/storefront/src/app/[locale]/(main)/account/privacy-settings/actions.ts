"use server";

import { getLocale } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { getStoreUrl, getStoreUrlWithPath } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { userService } from "@/services/user";

export async function requestUserAccountDeletion() {
  const region = await getCurrentRegion();
  const locale = await getLocale();
  const accessToken = await getAccessToken();

  const result = await userService.accountRequestDeletion({
    channel: region.market.channel,
    redirectUrl: getStoreUrlWithPath(
      await getStoreUrl(),
      paths.deleteAccount.asPath(),
    ),
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
