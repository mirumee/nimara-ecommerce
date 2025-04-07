import type { CountryCode } from "@nimara/codegen/schema";
import type { BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";
import type {
  AddressFormGetRowsInfra,
  SaleorAddressServiceConfig,
} from "#root/public/saleor/address/types";

import { parseAddressFormRows } from "../address-form/parse-address-form-rows";
import { AddressValidationRulesQueryDocument } from "../graphql/queries/generated";

export const saleorAddressFormGetRowsInfra = ({
  apiURL,
  logger,
}: SaleorAddressServiceConfig): AddressFormGetRowsInfra => {
  return async ({ countryCode }: { countryCode: CountryCode }) => {
    const { data, error } = await graphqlClient(apiURL).execute(
      AddressValidationRulesQueryDocument,
      {
        variables: {
          countryCode,
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
      logger.error("No data returned from Saleor");
      throw new Error("No data returned from Saleor");
    }

    if (!data.addressValidationRules) {
      logger.error("No address validation rules returned from Saleor");
      throw new Error("No data returned from Saleor");
    }

    return {
      isSuccess: true,
      addressFormRows: parseAddressFormRows({
        addressValidationRules: data.addressValidationRules,
        countryCode,
      }),
    };
  };
};
