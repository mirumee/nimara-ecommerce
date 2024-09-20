import { getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";

import { paths } from "@/lib/paths";

import { CheckoutRemover } from "./components/checkout-remover";

export async function generateMetadata() {
  const t = await getTranslations("order-confirmation");

  return {
    title: t("heading"),
  };
}

export default async function Page() {
  const t = await getTranslations();

  return (
    <div className="grid gap-8 font-normal">
      <h2 className="text-2xl font-normal">
        {t("order-confirmation.heading")}
      </h2>
      <p className="text-center text-gray-500">
        {t.rich("order-confirmation.paragraph", { br: () => <br /> })}
      </p>
      <Button className="justify-self-center" asChild>
        <a href={paths.home.asPath()}>{t("common.back-to-homepage")}</a>
      </Button>
      <CheckoutRemover />
    </div>
  );
}
