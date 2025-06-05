import { type AllCountryCode } from "@nimara/domain/consts";
import { err, ok } from "@nimara/domain/objects/Result";

import { translateAndSortCountries } from "#root/address/helpers";
import type {
  CountriesAllGetInfra,
  SaleorAddressServiceConfig,
} from "#root/address/types";
import { graphqlClient } from "#root/graphql/client";

import { CountriesQueryDocument } from "../graphql/queries/generated";

export const saleorCountriesAllGetInfra =
  ({ apiURL, logger }: SaleorAddressServiceConfig): CountriesAllGetInfra =>
  async ({ locale }) => {
    const result = await graphqlClient(apiURL).execute(CountriesQueryDocument, {
      operationName: "CountriesQuery",
    });

    if (!result.ok) {
      logger.error("Error fetching all countries from Saleor.", {
        result,
      });

      return result;
    }

    const countryCodes = result.data.shop?.countries.map(
      (country) => country.code,
    ) as AllCountryCode[];
    const countries = translateAndSortCountries(countryCodes, locale);

    if (!countries || countries.length === 0) {
      logger.error("No countries found in Saleor shop data.", {
        result,
      });

      return err([
        {
          code: "COUNTRIES_NOT_FOUND_ERROR",
        },
      ]);
    }

    return ok(countries);
  };
