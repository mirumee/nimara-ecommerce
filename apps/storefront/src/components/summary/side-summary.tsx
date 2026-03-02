import { getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@nimara/ui/components/sheet";

import { getCheckoutCollectionOrRedirect } from "@/lib/checkout";

import { ErrorDialog } from "../error-dialog";
import { Summary } from "./summary";

export const SideSummary = async () => {
  const [t, checkoutCollection] = await Promise.all([
    getTranslations("common"),
    getCheckoutCollectionOrRedirect(),
  ]);

  const { checkout } = checkoutCollection;

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
