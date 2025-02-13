"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import type { CountryCode, CountryDisplay } from "@nimara/codegen/schema";
import type { Address } from "@nimara/domain/objects/Address";
import type { AddressFormRow } from "@nimara/domain/objects/AddressForm";
import type { Checkout } from "@nimara/domain/objects/Checkout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nimara/ui/components/tabs";

import { useRouter } from "@/i18n/routing";
import type { FormattedAddress } from "@/lib/checkout";
import { paths } from "@/lib/paths";

import { CreateShippingAddressForm } from "../_forms/create-form";
import { UpdateShippingAddressForm } from "../_forms/update-form";
import { SavedAddresses } from "./saved-addresses";

interface AddressTabProps {
  addressFormRows: readonly AddressFormRow[];
  addresses: FormattedAddress[];
  checkout: Checkout;
  countries: Omit<CountryDisplay, "vat">[];
  countryCode: CountryCode;
}

type TabName = "new" | "saved";

export function AddressTab({
  addresses,
  checkout,
  countries,
  addressFormRows,
  countryCode,
}: AddressTabProps) {
  const t = useTranslations();

  const router = useRouter();
  const [editedAddress, setEditedAddress] = useState<Address | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>(
    addresses.length ? "saved" : "new",
  );

  function handleTabChange(value: string) {
    setActiveTab(value as TabName);
    router.replace(paths.checkout.shippingAddress.asPath());
  }

  return (
    <section className="space-y-8 pt-8">
      <h3 className="scroll-m-20 text-2xl tracking-tight">
        {t("shipping-address.title")}
      </h3>

      <div className="space-y-6">
        {!addresses.length ? (
          <CreateShippingAddressForm
            checkout={checkout}
            countryCode={countryCode}
            countries={countries}
            addressFormRows={addressFormRows}
            shouldSaveForFuture={!!addresses.length}
          />
        ) : (
          <Tabs
            defaultValue={activeTab}
            onValueChange={handleTabChange}
            className="grid gap-5"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="saved"
                aria-label={t("address.saved-addresses")}
              >
                {t("address.saved-addresses")}
              </TabsTrigger>
              <TabsTrigger value="new" aria-label={t("address.new-address")}>
                {t("address.new-address")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved">
              {editedAddress ? (
                <UpdateShippingAddressForm
                  address={editedAddress}
                  countryCode={countryCode}
                  countries={countries}
                  addressFormRows={addressFormRows}
                  setEditedAddress={setEditedAddress}
                />
              ) : (
                <SavedAddresses
                  addresses={addresses}
                  checkout={checkout}
                  setEditedAddress={setEditedAddress}
                />
              )}
            </TabsContent>

            <TabsContent value="new">
              <CreateShippingAddressForm
                checkout={checkout}
                countryCode={countryCode}
                countries={countries}
                addressFormRows={addressFormRows}
                shouldSaveForFuture={!!addresses.length}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </section>
  );
}
