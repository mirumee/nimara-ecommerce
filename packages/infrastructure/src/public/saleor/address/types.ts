import type { CountryCode } from "@nimara/codegen/schema";
import type { Address } from "@nimara/domain/objects/Address";
import type { AddressFormRow } from "@nimara/domain/objects/AddressForm";
import type { BaseError } from "@nimara/domain/objects/Error";

import type { QueryOptions } from "#root/lib/types";

export type AddressService<Config> = (config: Config) => {
  addressFormGetRows: AddressFormGetRowsUseCase;
  addressFormat: AddressFormatUseCase;
  countriesGet: CountriesGetInfra;
};

export interface SaleorAddressServiceConfig {
  apiURL: string;
}

export type AddressFormGetRowsInfra = ({
  countryCode,
}: {
  countryCode: CountryCode;
}) => Promise<{
  addressFormRows?: readonly AddressFormRow[] | null;
  errors?: BaseError[];
  isSuccess?: boolean;
}>;

export type AddressFormGetRowsUseCase = AddressFormGetRowsInfra;

export type AddressFormatInfra = (
  opts: { variables: { address: Address } } & QueryOptions,
) => Promise<{
  errors?: BaseError[];
  formattedAddress?: string[] | null;
  isSuccess?: boolean;
}>;

export type AddressFormatUseCase = AddressFormatInfra;

export type CountriesGetInfra = (opts: { channelSlug: string }) => Promise<{
  countries?: { code: string; country: string }[];
  errors?: BaseError[];
  isSuccess?: boolean;
}>;

export type CountriesGetUseCase = CountriesGetInfra;
