import { getTranslations } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { lazyLoadService } from "@/services/import";

import { SideLinks } from "./side-links";

export async function AccountSideMenu() {
  const [accessToken, userService] = await Promise.all([
    getAccessToken(),
    lazyLoadService("USER"),
  ]);
  const resultUserGet = await userService.userGet(accessToken);
  const t = await getTranslations();

  const user = resultUserGet.ok ? resultUserGet.data : null;

  return (
    <aside className="flex flex-col gap-8">
      {user && (
        <h1 className="hidden text-2xl md:block">
          {t("account.hello", { username: user.firstName })}
        </h1>
      )}

      <nav>
        <SideLinks />
      </nav>
    </aside>
  );
}
