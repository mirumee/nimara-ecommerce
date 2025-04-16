import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <div className="container flex place-content-center self-center">
      <div>
        <h2 className="text-center text-8xl">404</h2>
        <h2 className="text-center text-2xl">
          {t("errors.product.NOT_FOUND")}
        </h2>
      </div>
    </div>
  );
}
