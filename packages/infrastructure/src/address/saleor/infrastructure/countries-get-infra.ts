import { type AllCountryCode } from "@nimara/domain/consts";
import { err, ok } from "@nimara/domain/objects/Result";

import { translateAndSortCountries } from "#root/address/helpers";
import type {
  CountriesGetInfra,
  SaleorAddressServiceConfig,
} from "#root/address/types";
import { graphqlClient } from "#root/graphql/client";

import { ChannelQueryDocument } from "../graphql/queries/generated";

export const saleorCountriesGetInfra =
  ({ apiURL, logger }: SaleorAddressServiceConfig): CountriesGetInfra =>
  async ({ channelSlug, locale }) => {
    const result = await graphqlClient(apiURL).execute(ChannelQueryDocument, {
      variables: {
        channelSlug: channelSlug,
      },
      operationName: "ChannelQuery",
    });

    if (!result.ok) {
      logger.error("Error fetching countries from Saleor.", {
        channel: channelSlug,
        result,
      });

      return result;
    }

    if (!result.data.channel) {
      logger.critical("No channel found in Saleor.", {
        channel: channelSlug,
        result,
      });

      return err([
        {
          code: "COUNTRIES_NOT_FOUND_ERROR",
        },
      ]);
    }

    if (!result.data.channel.countries) {
      logger.error("No countries found in Saleor for this channel.", {
        channel: channelSlug,
        result,
      });

      return err([
        {
          code: "COUNTRIES_NOT_FOUND_ERROR",
        },
      ]);
    }

    const countryCodes = result.data.channel.countries.map(
      (country) => country.code,
    );
    const countries = translateAndSortCountries(
      countryCodes as AllCountryCode[],
      locale,
    );

    return ok(countries);
  };
