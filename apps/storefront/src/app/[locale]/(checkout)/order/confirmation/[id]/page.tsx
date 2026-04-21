import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { LocalizedLink } from "@nimara/i18n/routing";
import { Button } from "@nimara/ui/components/button";

import { paths } from "@/foundation/routing/paths";

type PageProps = {
  params: Promise<{ id: string; locale: Locale }>;
};

export async function generateMetadata() {
  const t = await getTranslations("order-confirmation");

  return {
    title: t("heading"),
  };
}

export default async function Page(_props: PageProps) {
  const t = await getTranslations();

  return (
    <div className="grid gap-8 font-normal">
      <h2 className="text-2xl font-normal">
        {t("order-confirmation.heading")}
      </h2>
      <p className="text-center text-gray-500 dark:text-muted-foreground">
        {t.rich("order-confirmation.paragraph", { br: () => <br /> })}
      </p>
      <Button className="justify-self-center" asChild>
        <LocalizedLink href={paths.home.asPath()}>
          {t("common.back-to-homepage")}
        </LocalizedLink>
      </Button>
    </div>
  );
}
