"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import { type CountryCode, type CountryDisplay } from "@nimara/codegen/schema";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nimara/ui/components/dialog";

import { AddNewAddressForm } from "../_forms/create-address-form";

interface AddNewAddressModalProps {
  addressFormRows: readonly AddressFormRow[];
  children: ReactNode;
  countries: Omit<CountryDisplay, "vat">[];
  countryCode: CountryCode;
}

export function AddNewAddressModal({
  addressFormRows,
  children,
  countries,
  countryCode,
}: AddNewAddressModalProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{children}</DialogTrigger>
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
