import { getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";

import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";

import { SignUpForm } from "./form";

export async function generateMetadata() {
  const t = await getTranslations("auth");

  return {
    title: t("create-account"),
  };
}

export default async function SignUpPage(props: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations();

  const isSuccess = searchParams?.success === "true";

  return (
    <div className="flex flex-col gap-8">
      {isSuccess ? (
        <>
          <h2 className="text-2xl font-normal leading-8 text-stone-900">
            {t("auth.create-account-success")}
          </h2>
          <div className="mt-7">
            <p className="text-sm text-stone-700">
              {t("auth.create-account-verify")}
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href={paths.home.asPath()}>
              {t("common.back-to-homepage")}
            </Link>
          </Button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-normal leading-8 text-stone-900">
            {t("auth.create-account")}
          </h2>

          <SignUpForm />

          <hr />

          <div className="mb-4">
            <h2 className="mb-12 text-2xl font-normal leading-8 text-stone-900">
              {t("auth.already-have-an-account")}
            </h2>
            <Button asChild className="w-full" variant="outline">
              <Link href={paths.signIn.asPath()}>{t("auth.sign-in")}</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
