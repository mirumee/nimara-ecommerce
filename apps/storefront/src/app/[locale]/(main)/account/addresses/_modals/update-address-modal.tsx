"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import type { CountryCode, CountryDisplay } from "@nimara/codegen/schema";
import type { Address } from "@nimara/domain/objects/Address";
import type { AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { loggingService } from "@nimara/infrastructure/logging/service";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";
import { Spinner } from "@nimara/ui/components/spinner";
import { useToast } from "@nimara/ui/hooks";

import { usePathname, useRouter } from "@/i18n/routing";

import { deleteAddress } from "../_forms/actions";
import { EditAddressForm } from "../_forms/update-address-form";

interface AddNewAddressModalProps {
  address: Address;
  addressFormRows: readonly AddressFormRow[];
  countries: Omit<CountryDisplay, "vat">[];
  countryCode: CountryCode;
}

export function EditAddressModal({
  address,
  addressFormRows,
  countries,
  countryCode,
}: AddNewAddressModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const t = useTranslations();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mode, setMode] = useState<"UPDATE" | "DELETE">("UPDATE");
  let content: ReactNode;

  params.set("country", address.country.code);

  async function handleAddressDelete() {
    setIsDeleting(true);
    const data = await deleteAddress(address.id);

    if (data?.errors.length) {
      loggingService.error("Failed to delete address", data.errors);

      return;
    }

    setIsDeleting(false);
    setIsOpen(false);
    toast({
      position: "center",
      description: t("address.address-has-been-removed"),
    });
  }

  if (mode === "UPDATE") {
    content = (
      <>
        <DialogHeader>
          <DialogTitle>{t("address.edit-address")}</DialogTitle>
        </DialogHeader>
        <EditAddressForm
          address={address}
          addressFormRows={addressFormRows}
          countries={countries}
          countryCode={countryCode}
          onModalClose={() => setIsOpen(false)}
          onModeChange={() => setMode("DELETE")}
        />
      </>
    );
  } else {
    content = (
      <>
        <DialogHeader>
          <DialogTitle>{t("address.delete-address")}</DialogTitle>
        </DialogHeader>
        <p className="pb-6 text-sm text-stone-500">
          {t("address.delete-address-description")}
        </p>
        <div className="flex justify-end gap-4">
          <Button disabled={isDeleting} onClick={handleAddressDelete}>
            {isDeleting ? (
              <span className="inline-flex items-center">
                <Spinner className="mr-2 h-4 w-4 text-white" />
                {t("common.please-wait")}
              </span>
            ) : (
              t("common.delete")
            )}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setMode("UPDATE")}>
              {t("common.cancel")}
            </Button>
          </DialogClose>
        </div>
      </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => router.push(`${pathname}?${params.toString()}`)}
        >
          {t("common.edit")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">{content}</DialogContent>
    </Dialog>
  );
}
