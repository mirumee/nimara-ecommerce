import { getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";

import { SignInForm } from "@/components/sign-in-form";
import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export default async function Page() {
  const t = await getTranslations("auth");

  return (
    <div className="flex flex-wrap pt-2 sm:flex-nowrap sm:pt-16">
      <div className="w-full pb-10 sm:w-1/2 sm:pr-12 md:pr-16">
        <SignInForm
          redirectUrl={paths.checkout.asPath({
            query: { loggedIn: "true" },
          })}
        />
      </div>
      <hr className="h-auto w-px bg-gray-300" />
      <div className="w-full sm:w-1/2 sm:pl-12 md:pl-16">
        <div className="pb-4 sm:pb-10">
          <h2 className="text-2xl font-normal leading-8 text-gray-900">
            {t("sign-up")}
          </h2>
          <p className="pb-2 pt-2 text-sm font-normal leading-5 text-stone-500">
            {t("by-creating-account")}
          </p>
          <Button className="my-4 w-full" disabled={true} variant="outline">
            {t("create-account")}
          </Button>
        </div>
        <div>
          <h2 className="text-2xl font-normal leading-8 text-gray-900">
            {t("or-continue-as-guest")}
          </h2>
          <p className="pb-2 pt-2 text-sm font-normal leading-5 text-stone-500">
            {t("you-wont-have-access")}
          </p>
          <Link href={paths.checkout.asPath()}>
            <Button className="my-4 w-full" variant="outline">
              {t("continue-as-guest")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
