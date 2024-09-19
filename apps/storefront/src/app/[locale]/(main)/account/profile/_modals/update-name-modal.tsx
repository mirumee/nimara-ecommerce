"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { type User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";

import { UpdateNameForm } from "../_forms/update-name-form";

export function UpdateNameModal({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("common.edit")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("account.change-your-name")}</DialogTitle>
        </DialogHeader>
        <UpdateNameForm user={user} onModalClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
