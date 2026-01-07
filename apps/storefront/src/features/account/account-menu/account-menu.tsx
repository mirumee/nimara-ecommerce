import { getTranslations } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { getUserService } from "@/services/user";

import { SideLinks } from "./side-links";

export async function AccountSideMenu() {
  const [accessToken, userService] = await Promise.all([
    getAccessToken(),
    getUserService(),
  ]);
  const resultUserGet = await userService.userGet(accessToken);
  const t = await getTranslations();

  const user = resultUserGet.ok ? resultUserGet.data : null;

  return (
    <aside className="flex flex-col gap-8">
      {user && (
        <h1 className="text-primary hidden text-2xl md:block">
          {t("account.hello", { username: user.firstName })}
        </h1>
      )}

      <nav>
        <SideLinks />
      </nav>
    </aside>
  );
}
