import { addressFormGetRowsUseCase } from "#root/use-cases/address/address-form-get-rows-use-case";
import { addressFormatUseCase } from "#root/use-cases/address/address-format-use-case";
import { countriesGetUseCase } from "#root/use-cases/address/countries-get-use-case";

import { saleorAddressFormGetRowsInfra } from "./infrastructure/address-form-get-rows-infra";
import { saleorAddressFormatInfra } from "./infrastructure/address-format-infra";
import { saleorCountriesGetInfra } from "./infrastructure/countries-get-infra";
import type { AddressService, SaleorAddressServiceConfig } from "./types";

export const saleorAddressService: AddressService<
  SaleorAddressServiceConfig
> = (config) => ({
  addressFormGetRows: addressFormGetRowsUseCase({
    addressFormGetRowsInfra: saleorAddressFormGetRowsInfra(config),
  }),
  addressFormat: addressFormatUseCase({
    addressFormatInfra: saleorAddressFormatInfra(config),
  }),
  countriesGet: countriesGetUseCase({
    countriesGetInfra: saleorCountriesGetInfra(config),
  }),
});
