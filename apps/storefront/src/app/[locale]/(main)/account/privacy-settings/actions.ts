"use server";

import { redirect } from "next/navigation";

import { getAccessToken } from "@/auth";
import { paths } from "@/lib/paths";
import { getStoreUrl } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { userService } from "@/services";

export async function requestUserAccountDeletion() {
  const region = await getCurrentRegion();

  const accessToken = await getAccessToken();

  const data = await userService.accountRequestDeletion({
    channel: region.market.channel,
    redirectUrl: `${await getStoreUrl()}${paths.deleteAccount.asPath()}`,
    accessToken,
  });

  if (data?.errors.length) {
    redirect(
      paths.account.privacySettings.asPath({ query: { error: "true" } }),
    );
  }

  redirect(
    paths.account.privacySettings.asPath({ query: { emailSent: "true" } }),
  );
}
