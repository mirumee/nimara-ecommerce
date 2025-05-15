import { getTranslations } from "next-intl/server";

import { type User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@nimara/ui/components/dialog";

import { UpdateEmailForm } from "../_forms/update-email-form";

export async function UpdateEmailModal({ user }: { user: User }) {
  const t = await getTranslations();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{t("common.edit")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <UpdateEmailForm oldEmail={user.email} />
      </DialogContent>
    </Dialog>
  );
}
