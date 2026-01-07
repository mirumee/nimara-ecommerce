import { getTranslations } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { getUserService } from "@/services/user";

import { UpdateEmailModal } from "./_modals/update-email-modal";
import { UpdateNameModal } from "./_modals/update-name-modal";
import { UpdatePasswordModal } from "./_modals/update-password-modal";

export default async function Page() {
  const [accessToken, t, userService] = await Promise.all([
    getAccessToken(),
    getTranslations(),
    getUserService(),
  ]);

  const resultUserGet = await userService.userGet(accessToken);

  const user = resultUserGet.ok ? resultUserGet.data : null;

  return (
    <div className="flex flex-col gap-8 text-sm">
      <h2 className="text-primary text-2xl">{t("account.personal-data")}</h2>
      <hr />
      <div className="grid grid-cols-12">
        <div className="col-span-8 sm:col-span-11">
          <h3 className="dark:text-muted-foreground text-stone-500">
            {t("account.first-and-last-name")}
          </h3>
          <p className="text-primary">
            {user?.firstName} {user?.lastName}
          </p>
        </div>
        <div className="col-span-4 flex justify-end sm:col-span-1">
          <UpdateNameModal user={user} />
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-12">
        <div className="col-span-8 sm:col-span-11">
          <h3 className="dark:text-muted-foreground text-stone-500">
            {t("common.email")}
          </h3>
          <p className="text-primary">{user?.email}</p>
        </div>
        {user && (
          <div className="col-span-4 flex justify-end sm:col-span-1">
            <UpdateEmailModal user={user} />
          </div>
        )}
      </div>
      <hr />
      <div className="grid grid-cols-12">
        <div className="col-span-8 sm:col-span-11">
          <h3 className="dark:text-muted-foreground text-stone-500">
            {t("common.password")}
          </h3>
          <p className="text-primary">•••••••••••••</p>
        </div>
        <div className="col-span-4 flex justify-end sm:col-span-1">
          <UpdatePasswordModal />
        </div>
      </div>
    </div>
  );
}
