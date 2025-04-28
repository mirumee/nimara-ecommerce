import type {
  CountriesGetInfra,
  CountriesGetUseCase,
} from "#root/address/types";

export const countriesGetUseCase = ({
  countriesGetInfra,
}: {
  countriesGetInfra: CountriesGetInfra;
}): CountriesGetUseCase => {
  return countriesGetInfra;
};
