import type { BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";
import type {
  CountriesGetInfra,
  SaleorAddressServiceConfig,
} from "#root/public/saleor/address/types";

import { ChannelQueryDocument } from "../graphql/queries/generated";

export const saleorCountriesGetInfra = ({
  apiURL,
}: SaleorAddressServiceConfig): CountriesGetInfra => {
  return async (opts: { channelSlug: string }) => {
    const { data, error } = await graphqlClient(apiURL).execute(
      ChannelQueryDocument,
      {
        variables: {
          channelSlug: opts.channelSlug,
        },
      },
    );

    if (error) {
      return {
        isSuccess: false,
        errors: [error as BaseError],
      };
    }

    if (!data) {
      // TODO: how to handle
      throw new Error("No data returned from Saleor");
    }

    if (!data.channel?.countries) {
      // TODO: how to handle
      throw new Error("No countries returned from Saleor");
    }

    return {
      isSuccess: true,
      countries: data.channel.countries,
    };
  };
};
