"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";

import { signOut } from "@/auth";
import { redirect } from "@/i18n/routing";
import { handleLogout } from "@/lib/actions/auth";
import { paths } from "@/lib/paths";
import { errorService } from "@/services/error";

export async function logout() {
  await handleLogout();
  const locale = await getLocale();

  try {
    await signOut();
  } catch (error) {
    errorService.logError(error);
  }

  revalidatePath(paths.home.asPath());
  redirect({
    href: paths.home.asPath({ query: { loggedOut: "true" } }),
    locale,
  });
}
