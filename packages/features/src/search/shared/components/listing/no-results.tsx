import { getTranslations } from "next-intl/server";

export const NoResults = async () => {
  const t = await getTranslations();

  return <h2 className="text-xl">{t("search.no-results")}</h2>;
};
