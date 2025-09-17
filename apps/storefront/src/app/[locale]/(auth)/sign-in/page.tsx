import { getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";

import { SignInForm } from "@/components/sign-in-form";
import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export async function generateMetadata() {
  const t = await getTranslations("auth");

  return {
    title: t("sign-in"),
  };
}

export default async function LoginPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-8">
      <SignInForm />

      <hr />

      <div className="mb-4">
        <h2 className="text-primary mb-12 text-2xl font-normal leading-8">
          {t("auth.first-time-on-nimara-store")}
        </h2>
        <Button asChild className="w-full" variant="outline">
          <LocalizedLink href={paths.createAccount.asPath()}>
            {t("auth.create-account")}
          </LocalizedLink>
        </Button>
      </div>
    </div>
  );
}
