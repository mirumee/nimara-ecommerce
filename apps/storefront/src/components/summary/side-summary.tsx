import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@nimara/ui/components/sheet";

import { COOKIE_KEY } from "@/config";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { checkoutService } from "@/services";

import { Summary } from "./summary";

const DynamicErrorDialog = dynamic(
  () => import("../error-dialog").then((mod) => mod.ErrorDialog),
  { ssr: false },
);

export const SideSummary = async () => {
  const checkoutId = cookies().get(COOKIE_KEY.checkoutId)?.value;
  const [t, region] = await Promise.all([
    getTranslations("common"),
    getCurrentRegion(),
  ]);

  if (!checkoutId) {
    redirect(paths.cart.asPath());
  }

  const { checkout } = await checkoutService.checkoutGet({
    checkoutId,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
  });

  if (!checkout) {
    redirect(paths.cart.asPath());
  }

  return (
    <>
      {!!checkout.problems.insufficientStock.length && (
        <DynamicErrorDialog checkout={checkout} />
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
