import { type AllCountryCode, type AllLocale } from "@nimara/domain/consts";
import {
  type Address,
  type CountryOption,
} from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type AsyncResult } from "@nimara/domain/objects/Result";

import type { QueryOptions } from "#root/lib/types";
import { type Logger } from "#root/logging/types";

export type AddressService<Config> = (config: Config) => {
  addressFormGetRows: AddressFormGetRowsUseCase;
  addressFormat: AddressFormatUseCase;
  countriesAllGet: CountriesAllGetInfra;
  countriesGet: CountriesGetInfra;
};

export interface SaleorAddressServiceConfig {
  apiURL: string;
  logger: Logger;
}

export type AddressFormGetRowsInfra = (opts: {
  countryCode: AllCountryCode;
}) => AsyncResult<readonly AddressFormRow[]>;

export type AddressFormGetRowsUseCase = AddressFormGetRowsInfra;

export type AddressFormatInfra = (
  opts: {
    locale: AllLocale;
    variables: {
      address: Address;
    };
  } & QueryOptions,
) => AsyncResult<{ formattedAddress: string[] }>;

export type AddressFormatUseCase = AddressFormatInfra;

export type CountriesGetInfra = (opts: {
  channelSlug: string;
  locale: AllLocale;
}) => AsyncResult<CountryOption[]>;

export type CountriesGetUseCase = CountriesGetInfra;

export type CountriesAllGetInfra = (opts: {
  locale: AllLocale;
}) => AsyncResult<CountryOption[]>;

export type CountriesAllGetUseCase = CountriesAllGetInfra;
