import type {
  CountriesAllGetInfra,
  CountriesAllGetUseCase,
} from "#root/address/types";

export const countriesAllGetUseCase = ({
  countriesAllGetInfra,
}: {
  countriesAllGetInfra: CountriesAllGetInfra;
}): CountriesAllGetUseCase => {
  return countriesAllGetInfra;
};
