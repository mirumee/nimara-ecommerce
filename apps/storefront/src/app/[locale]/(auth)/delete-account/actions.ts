"use server";

import { redirect } from "next/navigation";

import { handleLogout } from "@/foundation/auth/auth";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

export async function deleteUserAccount(token: string) {
  const accessToken = await getAccessToken();

  if (accessToken) {
    const services = await getServiceRegistry();
    const userService = await services.getUserService();
    const result = await userService.accountDelete({ accessToken, token });

    if (result.ok) {
      if (accessToken) {
        await handleLogout();
      }

      redirect(paths.home.asPath({ query: { accountDeleted: "true" } }));
    }
  }
}
