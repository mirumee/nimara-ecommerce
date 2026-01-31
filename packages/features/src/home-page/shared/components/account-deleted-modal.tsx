"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { LocalizedLink } from "@nimara/i18n/routing";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";

export function AccountDeletedModal({
  open,
  mailTo,
  paths,
}: {
  mailTo: string;
  open: boolean;
  paths: {
    home: string;
    privacyPolicy: string;
  };
}) {
  const [isOpen, setIsOpen] = useState(open);
  const t = useTranslations();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[385px]">
        <DialogHeader>
          <DialogTitle>
            {t("account.your-account-has-been-permanently-deleted")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-stone-500">
          {t.rich("account.in-case-of-any-questions", {
            contactUs: () => (
              <LocalizedLink
                href={`mailto:${mailTo}`}
                className="underline decoration-gray-400 underline-offset-2"
                target="_blank"
              >
                {t("common.contact-us")}
              </LocalizedLink>
            ),
            privacyPolicy: () => (
              <LocalizedLink
                href={paths.privacyPolicy}
                className="underline decoration-gray-400 underline-offset-2"
              >
                {t("common.privacy-policy")}
              </LocalizedLink>
            ),
          })}
        </p>
        <DialogFooter>
          <DialogClose asChild className="mt-4 w-full">
            <Button variant="outline" asChild>
              <LocalizedLink href={paths.home}>
                {t("common.close")}
              </LocalizedLink>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
