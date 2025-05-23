"use server";

import { redirect as appRedirect } from "next/navigation";
import { getLocale } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { userService } from "@/services/user";

export async function confirmEmailChangeAction(
  searchParams: Record<string, string>,
) {
  const [region, accessToken, locale] = await Promise.all([
    getCurrentRegion(),
    getAccessToken(),
    getLocale(),
  ]);
  const token = searchParams?.token ?? "";

  if (!accessToken) {
    redirect({ href: paths.signIn.asPath(), locale });
  }

  const result = await userService.confirmEmailChange({
    accessToken,
    channel: region.market.channel,
    token,
  });

  if (result.ok) {
    appRedirect("/api/logout");
  }

  return result;
}
