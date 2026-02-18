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
import type { FormattedAddress } from "@nimara/foundation/address/types";
import { useRouter } from "@nimara/i18n/routing";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nimara/ui/components/tabs";

import { useCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";

import { CreateShippingAddressForm } from "../forms/create-form";
import { UpdateShippingAddressForm } from "../forms/update-form";
import { SavedAddresses } from "./saved-addresses";

interface AddressTabProps {
  addressFormRows: readonly AddressFormRow[];
  addresses: FormattedAddress[];
  checkout: Checkout;
  countries: CountryOption[];
  countryCode: AllCountryCode;
}

type TabName = "new" | "saved";

export const AddressTab = ({
  addresses,
  checkout,
  countries,
  addressFormRows,
  countryCode,
}: AddressTabProps) => {
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
      router.replace(
        paths.checkout.asPath({ query: { step: "shipping-address" } }),
        {
          scroll: false,
        },
      );
    }

    if (value === "saved") {
      const savedAddressCountry = addresses[0]?.address.country;

      if (savedAddressCountry) {
        router.replace(
          paths.checkout.asPath({
            query: { step: "shipping-address", country: savedAddressCountry },
          }),
          { scroll: false },
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {!addresses.length ? (
        <CreateShippingAddressForm
          checkout={checkout}
          countryCode={countryCode}
          countries={countries}
          addressFormRows={addressFormRows}
          shouldSaveForFuture={false}
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
              shouldSaveForFuture={true}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
