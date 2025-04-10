import type { CountryCode } from "@nimara/codegen/schema";
import type { Address } from "@nimara/domain/objects/Address";
import type { AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type AsyncResult } from "@nimara/domain/objects/Result";

import type { QueryOptions } from "#root/lib/types";
import { type Logger } from "#root/logging/types";

export type AddressService<Config> = (config: Config) => {
  addressFormGetRows: AddressFormGetRowsUseCase;
  addressFormat: AddressFormatUseCase;
  countriesGet: CountriesGetInfra;
};

export interface SaleorAddressServiceConfig {
  apiURL: string;
  logger: Logger;
}

export type AddressFormGetRowsInfra = (opts: {
  countryCode: CountryCode;
}) => AsyncResult<readonly AddressFormRow[]>;

export type AddressFormGetRowsUseCase = AddressFormGetRowsInfra;

export type AddressFormatInfra = (
  opts: { variables: { address: Address } } & QueryOptions,
) => AsyncResult<{ formattedAddress: string[] }>;

export type AddressFormatUseCase = AddressFormatInfra;

export type CountriesGetInfra = (opts: {
  channelSlug: string;
}) => AsyncResult<{ code: string; country: string }[]>;

export type CountriesGetUseCase = CountriesGetInfra;
