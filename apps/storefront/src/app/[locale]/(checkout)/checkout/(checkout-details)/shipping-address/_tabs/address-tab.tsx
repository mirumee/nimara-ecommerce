"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { type AllCountryCode } from "@nimara/domain/consts";
import {
  type Address,
  type CountryOption,
} from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nimara/ui/components/tabs";

import { useRouter } from "@/i18n/routing";
import { type FormattedAddress } from "@/lib/checkout";
import { paths } from "@/lib/paths";
import { useCurrentRegion } from "@/regions/client";

import { CreateShippingAddressForm } from "../_forms/create-form";
import { UpdateShippingAddressForm } from "../_forms/update-form";
import { SavedAddresses } from "./saved-addresses";

interface AddressTabProps {
  addressFormRows: readonly AddressFormRow[];
  addresses: FormattedAddress[];
  checkout: Checkout;
  countries: CountryOption[];
  countryCode: AllCountryCode;
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
  const region = useCurrentRegion();

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabName);

    if (value === "new") {
      router.replace(paths.checkout.shippingAddress.asPath(), {
        scroll: false,
      });
    }

    if (value === "saved") {
      const country = addresses[0]?.address.country;

      if (country) {
        router.replace(
          paths.checkout.shippingAddress.asPath({
            query: { country },
          }),
          { scroll: false },
        );
      }
    }
  };

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
                countryCode={region.market.countryCode}
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
