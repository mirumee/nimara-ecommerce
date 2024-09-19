"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { signOut } from "@/auth";
import { handleLogout } from "@/lib/actions/auth";
import { paths } from "@/lib/paths";
import { errorService } from "@/services";

export async function logout() {
  await handleLogout();

  try {
    await signOut();
  } catch (error) {
    errorService.logError(error);
  }

  revalidatePath(paths.home.asPath());
  redirect(paths.home.asPath({ query: { loggedOut: "true" } }));
}
