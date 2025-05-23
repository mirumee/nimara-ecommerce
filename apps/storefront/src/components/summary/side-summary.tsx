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

  const resultCheckout = await checkoutService.checkoutGet({
    checkoutId,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
  });

  if (!resultCheckout.ok) {
    redirect({ href: paths.cart.asPath(), locale });
  }

  const { checkout } = resultCheckout.data;

  return (
    <>
      {!!checkout.problems.insufficientStock.length && (
        <ErrorDialog checkout={checkout} />
      )}
      <div className="col-span-5 hidden min-h-screen max-w-xl px-8 py-12 md:block">
        <Summary checkout={checkout} />
      </div>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost">{t("show-summary")}</Button>
          </SheetTrigger>
          <SheetContent side="right-full">
            <Summary checkout={checkout} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

SideSummary.displayName = "SideSummary";
