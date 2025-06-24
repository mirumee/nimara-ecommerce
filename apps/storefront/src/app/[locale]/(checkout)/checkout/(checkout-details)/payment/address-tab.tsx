"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type CountryOption } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { ADDRESS_CORE_FIELDS } from "@nimara/infrastructure/consts";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nimara/ui/components/tabs";

import { AddressForm } from "@/components/address-form/address-form";
import { CheckboxField } from "@/components/form/checkbox-field";
import { RadioFormGroup } from "@/components/form/radio-form-group";
import { useRouter } from "@/i18n/routing";
import { addressToSchema, displayFormattedAddressLines } from "@/lib/address";
import { type FormattedAddress } from "@/lib/checkout";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { useCurrentRegion } from "@/regions/client";

import { type TabName } from "./payment";
import { type Schema } from "./schema";

interface AddressTabProps {
  activeTab: TabName;
  addressFormRows: readonly AddressFormRow[];
  addresses: FormattedAddress[];
  countries: CountryOption[];
  countryCode: AllCountryCode;
  isDisabled?: boolean;
  setActiveTab: (value: TabName) => void;
  setIsCountryChanging?: (value: boolean) => void;
}

export function AddressTab({
  activeTab,
  addresses,
  countries,
  addressFormRows,
  countryCode,
  setActiveTab,
  setIsCountryChanging,
  isDisabled = false,
}: AddressTabProps) {
  const t = useTranslations();

  const router = useRouter();
  const form = useFormContext();
  const region = useCurrentRegion();

  const hasDefaultBillingAddressSet = addresses?.some(
    (item) => item.address?.isDefaultBillingAddress,
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabName);

    if (value === "new") {
      form.setValue("saveAddressForFutureUse", true);
      form.setValue("billingAddress", {
        ...ADDRESS_CORE_FIELDS.reduce(
          (acc, fieldName) => ({
            ...acc,
            [fieldName]: "",
          }),
          {},
        ),
        country: region.market.countryCode,
      });
    } else {
      form.setValue("saveAddressForFutureUse", false);
      form.setValue("billingAddress", {
        ...addressToSchema(addresses[0].address),
        id: addresses[0].address.id,
      });
    }

    setIsCountryChanging?.(true);
    router.push(paths.checkout.payment.asPath(), { scroll: false });
  };

  function handleCountryChange(value: string) {
    const address = JSON.parse(value) as Schema["billingAddress"];

    if (address?.country !== countryCode) {
      setIsCountryChanging?.(true);
    }
    form.setValue("billingAddress", address);
  }

  return (
    <div className="space-y-6">
      {!addresses.length ? (
        <>
          <AddressForm
            addressFormRows={addressFormRows}
            schemaPrefix="billingAddress"
            countries={countries}
          />
          {hasDefaultBillingAddressSet && (
            <CheckboxField
              className="pt-6"
              name="saveAddressForFutureUse"
              label={t("address.save-address-for-future")}
              disabled={isDisabled}
            />
          )}
        </>
      ) : (
        <Tabs
          defaultValue={activeTab}
          onValueChange={handleTabChange}
          className="grid gap-5"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="saved" disabled={isDisabled}>
              {t("address.saved-addresses")}
            </TabsTrigger>
            <TabsTrigger value="new" disabled={isDisabled}>
              {t("address.new-address")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved">
            <RadioFormGroup
              name="billingAddress"
              isSrOnlyLabel={true}
              options={addresses.map(({ address }) => ({
                value: JSON.stringify({
                  ...addressToSchema(address),
                  id: address.id,
                }),
              }))}
              isDisabled={isDisabled}
              onChange={(value) => handleCountryChange(value)}
              className="mb-0 rounded-none border-b-0 p-4 text-sm first-of-type:rounded-t last-of-type:rounded-b last-of-type:border-b"
            >
              {addresses.map(({ address, formattedAddress }) => (
                <div className="flex w-full flex-col gap-2" key={address.id}>
                  <div
                    className={cn("leading-5", {
                      "text-muted-foreground": isDisabled,
                    })}
                  >
                    {displayFormattedAddressLines({
                      addressId: address.id,
                      formattedAddress,
                    })}
                  </div>
                </div>
              ))}
            </RadioFormGroup>
          </TabsContent>

          <TabsContent value="new">
            <AddressForm
              addressFormRows={addressFormRows}
              schemaPrefix="billingAddress"
              countries={countries}
              isDisabled={isDisabled}
            />
            {hasDefaultBillingAddressSet && (
              <CheckboxField
                className="pt-6"
                name="saveAddressForFutureUse"
                label={t("address.save-address-for-future")}
                disabled={isDisabled}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
