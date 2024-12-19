"use server";

import { getLocale } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { getStoreUrl } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { userService } from "@/services";

export async function requestUserAccountDeletion() {
  const region = await getCurrentRegion();
  const locale = await getLocale();
  const accessToken = await getAccessToken();

  const data = await userService.accountRequestDeletion({
    channel: region.market.channel,
    redirectUrl: `${await getStoreUrl()}${paths.deleteAccount.asPath()}`,
    accessToken,
  });

  if (data?.errors.length) {
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
