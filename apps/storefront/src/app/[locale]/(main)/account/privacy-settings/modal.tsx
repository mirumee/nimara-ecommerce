"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@nimara/ui/components/button";
import { Checkbox } from "@nimara/ui/components/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";
import { Label } from "@nimara/ui/components/label";
import { Spinner } from "@nimara/ui/components/spinner";

import { clientEnvs } from "@/envs/client";
import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";

import { requestUserAccountDeletion } from "./actions";

const DELETE_ACCOUNT = "deleteAccount";

export function DeleteAccountModal() {
  const t = useTranslations();

  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [isDeleteAccountChecked, setIsDeleteAccountChecked] = useState(false);

  let content: ReactNode;

  if (searchParams.get("emailSent")) {
    content = (
      <>
        <DialogHeader>
          <DialogTitle>{t("account.confirm-account-deletion")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-sm text-stone-500">
            {t("account.confirm-account-deletion-description")}
          </p>
          <DialogFooter>
            <DialogClose asChild className="mt-4 w-full">
              <Button asChild>
                <Link href={paths.account.privacySettings.asPath()}>
                  {t("account.ok-i-will-check-my-email")}
                </Link>
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <DialogHeader>
          <DialogTitle>{t("account.delete-account")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {searchParams.get("error") ? (
            <p className="destructive text-sm">
              {t("errors.account.deleteAccount")}
            </p>
          ) : (
            <>
              <p className="text-sm text-stone-500">
                {t("account.delete-account-modal-description")}{" "}
                {t.rich("account.in-case-of-any-questions", {
                  contactUs: () => (
                    <Link
                      href={`mailto:${clientEnvs.NEXT_PUBLIC_DEFAULT_EMAIL}`}
                      className="underline decoration-gray-400 underline-offset-2"
                      target="_blank"
                    >
                      {t("common.contact-us")}
                    </Link>
                  ),
                  privacyPolicy: () => (
                    <Link
                      href={paths.privacyPolicy.asPath()}
                      className="underline decoration-gray-400 underline-offset-2"
                    >
                      {t("common.privacy-policy")}
                    </Link>
                  ),
                })}
              </p>
              <form action={requestUserAccountDeletion}>
                <div className="flex w-full gap-2">
                  <Checkbox
                    checked={isDeleteAccountChecked}
                    onCheckedChange={() =>
                      setIsDeleteAccountChecked(!isDeleteAccountChecked)
                    }
                    className="mt-1"
                    id={DELETE_ACCOUNT}
                    name={DELETE_ACCOUNT}
                  />
                  <Label className="!leading-5" htmlFor={DELETE_ACCOUNT}>
                    {t(
                      "account.i-want-permanently-delete-my-account-and-all-data-from-store",
                    )}
                  </Label>
                </div>
                <DialogFooter>
                  <SubmitButton disabled={!isDeleteAccountChecked} />
                </DialogFooter>
              </form>
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">{t("account.delete-account")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">{content}</DialogContent>
    </Dialog>
  );
}

function SubmitButton({ disabled }: Pick<ButtonProps, "disabled">) {
  const t = useTranslations();
  const { pending } = useFormStatus();

  return (
    <Button
      className="mt-4 w-full"
      disabled={disabled || pending}
      variant="destructive"
      type="submit"
    >
      {pending ? (
        <span className="inline-flex items-center">
          <Spinner className="mr-2 h-4 w-4 text-white" />
          {t("common.please-wait")}
        </span>
      ) : (
        t("account.delete-account")
      )}
    </Button>
  );
}
