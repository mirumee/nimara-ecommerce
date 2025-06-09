import type { CountryCode } from "@nimara/codegen/schema";
import { err, ok } from "@nimara/domain/objects/Result";

import type {
  AddressFormGetRowsInfra,
  SaleorAddressServiceConfig,
} from "#root/address/types";
import { graphqlClient } from "#root/graphql/client";

import { parseAddressFormRows } from "../address-form/parse-address-form-rows";
import { AddressValidationRulesQueryDocument } from "../graphql/queries/generated";

export const saleorAddressFormGetRowsInfra =
  ({ apiURL, logger }: SaleorAddressServiceConfig): AddressFormGetRowsInfra =>
  async ({ countryCode }: { countryCode: CountryCode }) => {
    const result = await graphqlClient(apiURL).execute(
      AddressValidationRulesQueryDocument,
      {
        variables: {
          countryCode,
        },
        operationName: "AddressValidationRulesQuery",
        options: {
          next: {
            tags: [`ADDRESS_VALIDATION_RULES:${countryCode}`],
            revalidate: 24 * 60 * 60, // 1 day
          },
        },
      },
    );

    if (!result.ok) {
      logger.error("Error while getting address validation rules", {
        errors: result.errors,
        countryCode,
      });

      return result;
    }

    if (!result.data) {
      logger.error("No data returned from Saleor", {
        countryCode,
      });

      return err([
        {
          code: "MISSING_ADDRESS_DATA_ERROR",
        },
      ]);
    }

    if (!result.data.addressValidationRules) {
      logger.error("No address validation rules returned from Saleor");

      return err([
        {
          code: "MISSING_ADDRESS_DATA_ERROR",
        },
      ]);
    }

    const parsedAddressFormRows = parseAddressFormRows({
      addressValidationRules: result.data.addressValidationRules,
      countryCode,
    });

    return ok(parsedAddressFormRows);
  };
