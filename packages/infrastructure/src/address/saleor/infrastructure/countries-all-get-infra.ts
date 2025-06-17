import { type AllCountryCode } from "@nimara/domain/consts";
import { err, ok } from "@nimara/domain/objects/Result";

import { translateAndSortCountries } from "#root/address/helpers";
import type {
  CountriesAllGetInfra,
  SaleorAddressServiceConfig,
} from "#root/address/types";
import { graphqlClient } from "#root/graphql/client";

import { CountriesQueryDocument } from "../graphql/queries/generated";

// This list contains country codes that should be excluded from the results.
// For example, "EU" is used to represent the European Union as a whole,
// which is not a specific country and should not be included in the list of countries.
// Once the Saleor API drops support for the EU country code,
// this exclusion can be removed.
const EXCLUDED_COUNTRY_CODES: string[] = ["EU"];

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

    const countryCodes = result.data.shop?.countries.reduce<AllCountryCode[]>(
      (acc, country) => {
        if (EXCLUDED_COUNTRY_CODES.includes(country.code)) {
          return acc;
        }

        acc.push(country.code as AllCountryCode);

        return acc;
      },
      [],
    );

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
