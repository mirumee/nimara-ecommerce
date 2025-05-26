import { addressFormGetRowsUseCase } from "#root/use-cases/address/address-form-get-rows-use-case";
import { addressFormatUseCase } from "#root/use-cases/address/address-format-use-case";
import { countriesAllGetUseCase } from "#root/use-cases/address/countries-all-get-use-case";
import { countriesGetUseCase } from "#root/use-cases/address/countries-get-use-case";

import { saleorAddressFormGetRowsInfra } from "./saleor/infrastructure/address-form-get-rows-infra";
import { saleorAddressFormatInfra } from "./saleor/infrastructure/address-format-infra";
import { saleorCountriesAllGetInfra } from "./saleor/infrastructure/countries-all-get-infra";
import { saleorCountriesGetInfra } from "./saleor/infrastructure/countries-get-infra";
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
  countriesAllGet: countriesAllGetUseCase({
    countriesAllGetInfra: saleorCountriesAllGetInfra(config),
  }),
});
