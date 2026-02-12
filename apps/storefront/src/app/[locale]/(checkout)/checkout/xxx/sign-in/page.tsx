import { getTranslations } from "next-intl/server";

import { LocalizedLink } from "@nimara/i18n/routing";
import { Button } from "@nimara/ui/components/button";

import { SignInForm } from "@/foundation/auth/sign-in/sign-in-form";
import { paths } from "@/foundation/routing/paths";

export default async function Page() {
  const t = await getTranslations("auth");

  return (
    <div className="flex flex-wrap pb-8 pt-2 sm:pt-16">
      <div className="w-full pb-10">
        <SignInForm
          redirectUrl={paths.checkout.asPath({
            query: { loggedIn: "true" },
          })}
        />
      </div>

      <hr />

      <div className="w-full">
        <div className="pb-4 sm:pb-10">
          <h2 className="text-2xl font-normal leading-8 text-foreground">
            {t("sign-up")}
          </h2>
          <p className="pb-2 pt-2 text-sm font-normal leading-5 text-stone-500">
            {t("by-creating-account")}
          </p>
          <Button className="my-4 w-full" variant="outline" asChild>
            <LocalizedLink
              href={paths.createAccount.asPath({
                query: {
                  next: paths.checkout.asPath({
                    query: { step: "user-details" },
                  }),
                },
              })}
            >
              {t("create-account")}
            </LocalizedLink>
          </Button>
        </div>
        <div>
          <h2 className="text-2xl font-normal leading-8 text-foreground">
            {t("or-continue-as-guest")}
          </h2>
          <p className="pb-2 pt-2 text-sm font-normal leading-5 text-stone-500">
            {t("you-wont-have-access")}
          </p>
          <Button className="my-4 w-full" variant="outline" asChild>
            <LocalizedLink
              href={paths.checkout.asPath({ query: { step: "user-details" } })}
            >
              {t("continue-as-guest")}
            </LocalizedLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
