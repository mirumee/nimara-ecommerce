"use client";

import { useTranslations } from "next-intl";
import { type Dispatch, type SetStateAction } from "react";

import { Button } from "@nimara/ui/components/button";
import { Checkbox } from "@nimara/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import { Label } from "@nimara/ui/components/label";

import {
  ACCEPT_ALL_CONSENT,
  type ConsentCategories,
  REJECT_ALL_CONSENT,
} from "@/foundation/consent";

type Props = {
  categories: ConsentCategories;
  onClose: () => void;
  persist: (next: ConsentCategories) => void;
  setCategories: Dispatch<SetStateAction<ConsentCategories>>;
};

export const CookieSettings = ({
  categories,
  onClose,
  persist,
  setCategories,
}: Props) => {
  const t = useTranslations("cookie-settings");

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="cookie-category-necessary"
              checked
              disabled
              className="mt-1"
            />
            <div className="flex flex-col gap-1">
              <Label htmlFor="cookie-category-necessary">
                {t("necessary.title")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("necessary.description")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="cookie-category-analytics"
              checked={categories.analytics}
              onCheckedChange={(checked) =>
                setCategories((prev) => ({
                  ...prev,
                  analytics: checked === true,
                }))
              }
              className="mt-1"
            />
            <div className="flex flex-col gap-1">
              <Label htmlFor="cookie-category-analytics">
                {t("analytics.title")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("analytics.description")}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => persist(REJECT_ALL_CONSENT)}>
            {t("reject-all")}
          </Button>
          <Button variant="outline" onClick={() => persist(ACCEPT_ALL_CONSENT)}>
            {t("accept-all")}
          </Button>
          <Button onClick={() => persist(categories)}>{t("save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
