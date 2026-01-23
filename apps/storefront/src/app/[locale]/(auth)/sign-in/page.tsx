import { getTranslations } from "next-intl/server";

import { Link as LocalizedLink } from "@nimara/i18n/routing";
import { Button } from "@nimara/ui/components/button";

import { SignInForm } from "@/foundation/auth/sign-in/sign-in-form";
import { paths } from "@/foundation/routing/paths";

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
        <h2 className="mb-12 text-2xl font-normal leading-8 text-primary">
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
