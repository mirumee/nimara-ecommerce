import type {
  CountriesGetInfra,
  CountriesGetUseCase,
} from "#root/public/saleor/address/types";

export const countriesGetUseCase = ({
  countriesGetInfra,
}: {
  countriesGetInfra: CountriesGetInfra;
}): CountriesGetUseCase => {
  return countriesGetInfra;
};
