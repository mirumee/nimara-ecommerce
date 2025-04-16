import { getLocale, getTranslations } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { userService } from "@/services";

export default async function ConfirmEmailChangePage(props: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams?.token ?? "";
  const accessToken = await getAccessToken();
  const locale = await getLocale();

  const [region, t] = await Promise.all([
    getCurrentRegion(),
    getTranslations(),
  ]);

  if (accessToken) {
    const result = await userService.confirmEmailChange({
      accessToken,
      channel: region.market.channel,
      token,
    });

    if (result.ok) {
      redirect({ href: paths.signIn.asPath(), locale });
    }

    if (result.errors) {
      return t("auth.too-much-time-has-passed");
    }
  }

  return null;
}
