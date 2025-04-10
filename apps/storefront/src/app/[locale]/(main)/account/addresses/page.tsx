import { PlusIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { CountryCode } from "@nimara/codegen/schema";
import type { Address } from "@nimara/domain/objects/Address";
import { Button } from "@nimara/ui/components/button";

import { getAccessToken } from "@/auth";
import { displayFormattedAddressLines } from "@/lib/address";
import { getCurrentRegion } from "@/regions/server";
import { addressService, userService } from "@/services";

import { AddNewAddressModal } from "./_modals/create-address-modal";
import { EditAddressModal } from "./_modals/update-address-modal";

export default async function Page(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  const accessToken = await getAccessToken();
  const [t, region, resultAddresses] = await Promise.all([
    getTranslations(),
    getCurrentRegion(),
    userService.addressesGet({ variables: { accessToken } }),
  ]);

  const savedAddresses = resultAddresses.data ?? [];
  const formattedAddresses =
    (await Promise.all(
      savedAddresses.map(async (address) => {
        const resultFormatAddress = await addressService.addressFormat({
          variables: { address },
        });

        if (!resultFormatAddress.ok) {
          throw new Error("No address format.");
        }

        return {
          ...resultFormatAddress.data,
          ...address,
        };
      }),
    )) ?? [];

  const defaultAddresses: typeof formattedAddresses = [];
  const rest: typeof defaultAddresses = [];

  formattedAddresses.forEach((a) => {
    if (
      (a.isDefaultBillingAddress || a.isDefaultShippingAddress) &&
      !defaultAddresses.some((address) => address.id === a.id)
    ) {
      defaultAddresses.push(a);

      return;
    }
    rest.push(a);
  });

  const sortedAddresses = [...defaultAddresses, ...rest];
  const noAddresses = !resultAddresses.data?.length;

  function getDefaultAddressLabel({
    isDefaultBillingAddress,
    isDefaultShippingAddress,
  }: Pick<Address, "isDefaultBillingAddress" | "isDefaultShippingAddress">) {
    return isDefaultBillingAddress && isDefaultShippingAddress
      ? "address.default-shipping-and-billing"
      : isDefaultShippingAddress
        ? "address.default-shipping"
        : "address.default-billing";
  }

  const resultCountries = await addressService.countriesGet({
    channelSlug: region.market.channel,
  });

  if (!resultCountries.ok) {
    throw new Error("No countries.");
  }

  const countryCode = (() => {
    const defaultCountryCode = region.market.countryCode;
    const paramsCountryCode = searchParams.country;

    if (!paramsCountryCode) {
      return defaultCountryCode;
    }
    const isValidCountryCode = resultCountries.data.some(
      (country) => country.code === paramsCountryCode,
    );

    if (!isValidCountryCode) {
      return defaultCountryCode;
    }

    return paramsCountryCode;
  })() as CountryCode;

  const resultAddressRows = await addressService.addressFormGetRows({
    countryCode: countryCode,
  });

  if (!resultAddressRows.ok) {
    throw new Error("No address form rows.");
  }

  return (
    <div className="flex flex-col gap-8 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">{t("account.addresses")}</h2>
        {!noAddresses && (
          <AddNewAddressModal
            addressFormRows={resultAddressRows.data}
            countries={resultCountries.data}
            countryCode={countryCode}
          >
            <Button
              variant="outline"
              className="flex items-center gap-1 rounded px-[11px] sm:rounded-md sm:px-4"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:block">
                {t("address.add-new-address")}
              </span>
            </Button>
          </AddNewAddressModal>
        )}
      </div>
      {noAddresses && (
        <div className="space-y-8">
          <hr />
          <p className="text-stone-500">
            {t("address.sorry-you-dont-have-any-addresses")}
          </p>
          <AddNewAddressModal
            addressFormRows={resultAddressRows.data}
            countries={resultCountries.data}
            countryCode={countryCode}
          >
            <Button className="mt-6 flex items-center gap-1">
              <PlusIcon className="h-4 w-4" />
              {t("address.add-new-address")}
            </Button>
          </AddNewAddressModal>
        </div>
      )}
      {sortedAddresses.map(
        ({ isDefaultBillingAddress, isDefaultShippingAddress, ...address }) => (
          <div key={address.id} className="space-y-8">
            <hr />
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5 md:col-span-7 lg:col-span-5">
                {displayFormattedAddressLines({
                  addressId: address.id,
                  formattedAddress: address.formattedAddress,
                })}
              </div>
              <div className="col-span-7 flex h-max items-center justify-end gap-6 md:col-span-5 lg:col-span-7">
                {(isDefaultBillingAddress || isDefaultShippingAddress) && (
                  <p className="hidden text-end font-semibold sm:block">
                    {t(
                      getDefaultAddressLabel({
                        isDefaultBillingAddress,
                        isDefaultShippingAddress,
                      }),
                    )}
                  </p>
                )}
                <EditAddressModal
                  address={{
                    isDefaultBillingAddress,
                    isDefaultShippingAddress,
                    ...address,
                  }}
                  addressFormRows={resultAddressRows.data}
                  countries={resultCountries.data}
                  countryCode={countryCode}
                />
              </div>

              {(isDefaultBillingAddress || isDefaultShippingAddress) && (
                <div className="col-span-12 pt-2 sm:hidden">
                  <p className="font-semibold">
                    {t(
                      getDefaultAddressLabel({
                        isDefaultBillingAddress,
                        isDefaultShippingAddress,
                      }),
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
