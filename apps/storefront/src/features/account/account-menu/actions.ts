"use server";

import * as Sentry from "@sentry/nextjs";
import { getLocale } from "next-intl/server";

import { redirect } from "@nimara/i18n/routing";

import { signOut } from "@/auth";
import { handleLogout } from "@/foundation/auth/auth";
import { revalidateLocalizedPath } from "@/foundation/cache/cache";
import { paths } from "@/foundation/routing/paths";
import { errorService } from "@/services/error";

export async function logout() {
  await handleLogout();
  const locale = await getLocale();

  try {
    await signOut();
    Sentry.setUser(null);
  } catch (error) {
    errorService.logError(error);
  }

  await revalidateLocalizedPath(paths.home.asPath());
  redirect({
    href: paths.home.asPath({ query: { loggedOut: "true" } }),
    locale,
  });
}
