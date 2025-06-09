import { err, ok } from "@nimara/domain/objects/Result";

import type {
  AddressFormatInfra,
  SaleorAddressServiceConfig,
} from "#root/address/types";
import { graphqlClient } from "#root/graphql/client";

import { formatAddress } from "../address-form/format-address";
import { AddressValidationRulesQueryDocument } from "../graphql/queries/generated";

export const saleorAddressFormatInfra =
  ({ apiURL, logger }: SaleorAddressServiceConfig): AddressFormatInfra =>
  async ({ locale, variables: { address }, skip = false }) => {
    if (skip) {
      logger.debug("Skipping the address format.");

      return ok({ formattedAddress: [] });
    }

    const result = await graphqlClient(apiURL).execute(
      AddressValidationRulesQueryDocument,
      {
        variables: {
          countryCode: address.country,
        },
        operationName: "AddressValidationRulesQuery",
        options: {
          next: {
            tags: ["ADDRESS_VALIDATION_RULES"],
            revalidate: 24 * 60 * 60, // 1 day
          },
        },
      },
    );

    if (!result.ok) {
      logger.error("Failed to validate addresses format", {
        errors: result.errors,
      });

      return result;
    }

    if (!result.data.addressValidationRules) {
      logger.error("No data returned from Saleor.", { error: result.data });

      return err([
        {
          code: "MISSING_ADDRESS_DATA_ERROR",
        },
      ]);
    }

    const formattedAddress = formatAddress({
      addressValidationRules: result.data.addressValidationRules,
      address,
      locale,
    });

    return ok({ formattedAddress });
  };
