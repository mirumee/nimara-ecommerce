import { type AddressInput } from "@nimara/codegen/schema";
import { type AllCountryCode, type AllLocale } from "@nimara/domain/consts";
import {
  type Address,
  type CountryOption,
} from "@nimara/domain/objects/Address";

import { ADDRESS_CORE_FIELDS } from "#root/consts";
import { pick } from "#root/lib/core";

export const addressToInput = ({
  country,
  ...address
}: Partial<Omit<Address, "id">>): AddressInput => ({
  // @ts-expect-error Dunno why it's complaining about country
  ...pick(address, ADDRESS_CORE_FIELDS),
  country: country as AllCountryCode,
});

/**
 * Translate and sort a list of country codes into CountryOption objects.
 * @param countryCodes - An array of country codes to translate and sort.
 * @param locale - The locale to use for translation. Defaults to "en".
 * @returns
 */
export const translateAndSortCountries = (
  countryCodes: AllCountryCode[],
  locale: AllLocale = "en",
): CountryOption[] =>
  countryCodes
    .map((code) => ({
      value: code,
      label: new Intl.DisplayNames([locale], { type: "region" }).of(
        code,
      ) as string,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
