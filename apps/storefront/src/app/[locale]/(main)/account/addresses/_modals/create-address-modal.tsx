"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useState } from "react";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type CountryOption } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";

import { useRouter } from "@/i18n/routing";
import { paths } from "@/lib/paths";

import { AddNewAddressForm } from "../_forms/create-address-form";

interface AddNewAddressModalProps {
  addressFormRows: readonly AddressFormRow[];
  children: ReactNode;
  countries: CountryOption[];
  countryCode: AllCountryCode;
}

export function AddNewAddressModal({
  addressFormRows,
  children,
  countries,
  countryCode,
}: AddNewAddressModalProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("country")) {
      router.push(paths.account.addresses.asPath());
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("address.add-new-address")}</DialogTitle>
        </DialogHeader>
        <AddNewAddressForm
          addressFormRows={addressFormRows}
          countries={countries}
          countryCode={countryCode}
          onModalClose={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
