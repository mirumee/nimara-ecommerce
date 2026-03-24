import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <div className="flex min-h-[50dvh] w-full flex-col items-center justify-center">
      <h2 className="text-center text-8xl">404</h2>
      <h2 className="text-center text-2xl">{t("common.not-found")}</h2>
    </div>
  );
}
