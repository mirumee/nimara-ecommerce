"use server";

import { redirect as appRedirect } from "next/navigation";
import { getLocale } from "next-intl/server";

import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { redirect } from "@/i18n/routing";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

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

  const services = await getServiceRegistry();
  const userService = await services.getUserService();
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
