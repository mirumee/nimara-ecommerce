"use client";

import { useTranslations } from "next-intl";

import { type Checkout } from "@nimara/domain/objects/Checkout";
// TODO: When we try to move this compoentn this Line genrate circular dependency. How to organize moving it?
import { Line } from "@nimara/features/shared/shopping-bag/components/line";
import { useLocalizedLink } from "@nimara/foundation/i18n/hooks/use-localized-link";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";

type ErrorDialogProps = {
  cartPath: string;
  checkout: Checkout;
};

export const ErrorDialog = ({ checkout, cartPath }: ErrorDialogProps) => {
  const t = useTranslations();
  const LocalizedLink = useLocalizedLink();

  const unavailableLinesNumber = checkout.problems.insufficientStock.length;

  return (
    <Dialog open>
      <DialogContent
        withCloseButton={false}
        className="bg-white sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>
            {t(
              unavailableLinesNumber === 1
                ? "stock-errors.some-of-products-unavailable"
                : "stock-errors.products-unavailable",
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <DialogDescription>
            {t(
              unavailableLinesNumber === 1
                ? "stock-errors.some-of-products-message"
                : "stock-errors.products-message",
            )}
          </DialogDescription>
        </div>
        <div className="grid gap-4 py-4">
          {checkout.problems.insufficientStock.map(({ line }) => (
            <Line key={line.id} line={line} isLineEditable={false} />
          ))}
        </div>
        <DialogFooter>
          <div className="grid w-full gap-4">
            <DialogClose asChild>
              <Button asChild>
                <LocalizedLink href={cartPath}>
                  {t("stock-errors.back-to-cart")}
                </LocalizedLink>
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
