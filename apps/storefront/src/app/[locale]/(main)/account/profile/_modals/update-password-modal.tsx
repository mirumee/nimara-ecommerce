"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";

import { UpdatePasswordForm } from "../_forms/update-password-form";

export function UpdatePasswordModal() {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>
          {t("common.edit")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("account.change-password")}</DialogTitle>
        </DialogHeader>
        <UpdatePasswordForm onModalClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
