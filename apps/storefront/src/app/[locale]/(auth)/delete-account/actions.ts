"use server";

import { redirect } from "next/navigation";

import { getAccessToken } from "@/auth";
import { handleLogout } from "@/foundation/auth/auth";
import { paths } from "@/foundation/routing/paths";
import { getUserService } from "@/services/user";

export async function deleteUserAccount(token: string) {
  const accessToken = await getAccessToken();

  if (accessToken) {
    const userService = await getUserService();
    const result = await userService.accountDelete({ accessToken, token });

    if (result.ok) {
      if (accessToken) {
        await handleLogout();
      }

      redirect(paths.home.asPath({ query: { accountDeleted: "true" } }));
    }
  }
}
