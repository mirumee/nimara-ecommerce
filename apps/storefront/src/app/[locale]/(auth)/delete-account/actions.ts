"use server";

import { redirect } from "next/navigation";

import { getAccessToken } from "@/auth";
import { handleLogout } from "@/lib/actions/auth";
import { paths } from "@/lib/paths";
import { userService } from "@/services/user";

export async function deleteUserAccount(token: string) {
  const accessToken = await getAccessToken();

  if (accessToken) {
    const result = await userService.accountDelete({ accessToken, token });

    if (result.ok) {
      if (accessToken) {
        await handleLogout();
      }

      redirect(paths.home.asPath({ query: { accountDeleted: "true" } }));
    }
  }
}
