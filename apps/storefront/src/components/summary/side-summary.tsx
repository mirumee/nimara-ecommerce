import { cookies } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@nimara/ui/components/sheet";

import { COOKIE_KEY } from "@/config";
import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { checkoutService } from "@/services";

import { ErrorDialog } from "../error-dialog";
import { Summary } from "./summary";

export const SideSummary = async () => {
  const checkoutId = (await cookies()).get(COOKIE_KEY.checkoutId)?.value;
  const [t, region, locale] = await Promise.all([
    getTranslations("common"),
    getCurrentRegion(),
    getLocale(),
  ]);

  if (!checkoutId) {
    redirect({ href: paths.cart.asPath(), locale });
  }

  const { checkout } = await checkoutService.checkoutGet({
    checkoutId,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
  });

  if (!checkout) {
    redirect({ href: paths.cart.asPath(), locale });
  }

  return (
    <>
      {!!checkout.problems.insufficientStock.length && (
        <ErrorDialog checkout={checkout} />
      )}
      <aside className="col-span-5 hidden min-h-screen bg-gray-100 pl-12 pr-24 pt-24 md:block">
        <Summary checkout={checkout} />
      </aside>
      <aside className="span-col-1 absolute right-0 pt-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost">{t("show-summary")}</Button>
          </SheetTrigger>
          <SheetContent side="right-full">
            <Summary checkout={checkout} />
          </SheetContent>
        </Sheet>
      </aside>
    </>
  );
};

SideSummary.displayName = "SideSummary";
