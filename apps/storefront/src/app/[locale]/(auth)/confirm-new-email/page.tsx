import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { userService } from "@/services";

export default async function ConfirmEmailChangePage({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  const token = searchParams?.token ?? "";
  const accessToken = getAccessToken();

  const [region, t] = await Promise.all([
    getCurrentRegion(),
    getTranslations(),
  ]);

  if (accessToken) {
    const data = await userService.confirmEmailChange({
      accessToken,
      channel: region.market.channel,
      token,
    });

    if (data?.user?.id && !data?.errors.length) {
      redirect(paths.signIn.asPath());
    }

    if (data?.errors) {
      return t("auth.too-much-time-has-passed");
    }
  }

  return null;
}
