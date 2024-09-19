import type { CountryCode } from "@nimara/codegen/schema";
import type { BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";
import { loggingService } from "#root/logging/service";
import type {
  AddressFormatInfra,
  SaleorAddressServiceConfig,
} from "#root/public/saleor/address/types";

import { formatAddress } from "../address-form/format-address";
import { AddressValidationRulesQueryDocument } from "../graphql/queries/generated";

export const saleorAddressFormatInfra = ({
  apiURL,
}: SaleorAddressServiceConfig): AddressFormatInfra => {
  return async ({ variables: { address }, skip = false }) => {
    if (skip) {
      return {
        isSuccess: true,
        formattedAddress: [],
      };
    }

    const { data, error } = await graphqlClient(apiURL).execute(
      AddressValidationRulesQueryDocument,
      {
        variables: {
          countryCode: address.country.code as CountryCode,
        },
      },
    );

    if (error) {
      loggingService.error(
        "Failed to validate addresses format",
        error as BaseError,
      );

      return {
        isSuccess: false,
        errors: [error as BaseError],
      };
    }

    if (!data) {
      throw new Error("No data returned from Saleor");
    }

    if (!data.addressValidationRules) {
      throw new Error("No data returned from Saleor");
    }

    return {
      isSuccess: true,
      formattedAddress: formatAddress({
        addressValidationRules: data.addressValidationRules,
        address,
      }),
    };
  };
};
