import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";
import type {
  CountriesGetInfra,
  SaleorAddressServiceConfig,
} from "#root/public/saleor/address/types";

import { ChannelQueryDocument } from "../graphql/queries/generated";

export const saleorCountriesGetInfra =
  ({ apiURL, logger }: SaleorAddressServiceConfig): CountriesGetInfra =>
  async (opts: { channelSlug: string }) => {
    const result = await graphqlClientV2(apiURL).execute(ChannelQueryDocument, {
      variables: {
        channelSlug: opts.channelSlug,
      },
      operationName: "ChannelQuery",
    });

    if (!result.ok) {
      logger.error("Error fetching countries from Saleor.", {
        channel: opts.channelSlug,
        result,
      });

      return result;
    }

    if (!result.data.channel) {
      logger.critical("No channel found in Saleor.", {
        channel: opts.channelSlug,
        result,
      });

      return err({
        code: "COUNTRIES_NOT_FOUND_ERROR",
      });
    }

    if (!result.data.channel.countries) {
      logger.error("No countries found in Saleor for this channel.", {
        channel: opts.channelSlug,
        result,
      });

      return err({
        code: "COUNTRIES_NOT_FOUND_ERROR",
      });
    }

    return ok(result.data.channel.countries);
  };
