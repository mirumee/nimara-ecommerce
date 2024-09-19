import { getTranslations } from "next-intl/server";

import { DeleteAccountModal } from "./modal";

export default async function Page() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-8 text-sm">
      <h2 className="text-2xl">{t("account.privacy-settings")}</h2>
      <hr />
      <div className="grid grid-cols-12 gap-x-4 gap-y-6">
        <div className="col-span-12 space-y-1 sm:col-span-9 md:col-span-8 lg:col-span-9">
          <h3 className="font-medium text-stone-900">
            {t("account.delete-account-and-all-your-data-permanently")}
          </h3>
          <p className="text-stone-500">
            {t("account.delete-account-description")}
          </p>
        </div>
        <div className="col-span-12 flex items-center sm:col-span-3 sm:justify-end md:col-span-4 lg:col-span-3">
          <DeleteAccountModal />
        </div>
      </div>
    </div>
  );
}
