import { type CountryCode, parsePhoneNumberWithError } from "libphonenumber-js";

import { type AllLocale } from "@nimara/domain/consts";
import type { Address } from "@nimara/domain/objects/Address";

import type { AddressValidationRulesQuery_addressValidationRules_AddressValidationData } from "../../saleor/graphql/queries/generated";

const LINE_BREAK = "\n";

export const formatAddress = ({
  addressValidationRules,
  address,
  locale,
}: {
  address: Address;
  addressValidationRules: AddressValidationRulesQuery_addressValidationRules_AddressValidationData;
  locale: AllLocale;
}) => {
  const name = address.firstName
    ? `${address.firstName} ${address.lastName}`
    : address.lastName;
  const hasName = address.firstName || address.lastName;
  const formattedPhone = address?.phone
    ? (parsePhoneNumberWithError(
        address.phone,
        address.country as CountryCode,
      )?.formatInternational() ?? "")
    : "";
  const fullName =
    hasName && address.companyName
      ? [name, LINE_BREAK, address.companyName]
      : hasName && !address.companyName
        ? [name]
        : [address.companyName];

  const formattedAddress = addressValidationRules.addressFormat
    .split("")
    .reduce((acc: string[], char, i, self) => {
      const result = (() => {
        switch (char) {
          case "N": {
            if (hasName && address.phone) {
              return [...fullName, LINE_BREAK, formattedPhone];
            }
            if (hasName && !address.phone) {
              return [...fullName];
            }
            if (!hasName && address.phone) {
              return [formattedPhone];
            }
          }
          case "O": // not supported in design
            return [];
          case "A":
            return address.streetAddress1
              ? [`${address.streetAddress1} ${address.streetAddress2}`]
              : [];
          case "C":
            return address.city ? [address.city] : [];
          case "S":
            return address.countryArea ? [address.countryArea] : [];
          case "Z":
            return address.postalCode ? [address.postalCode] : [];
          case "D": // NOT SUPPORTED Dependent locality (may be an inner-city district or a suburb)
            return [];
          case "n": {
            const prevCharIsOrg = self[i - 2] === "O"; // until we support organization

            return prevCharIsOrg ? [] : [LINE_BREAK];
          }
          case "%":
            return [];
          default:
            return [char];
        }
      })();

      return [...acc, ...result];
    }, []);

  const fullAddress = [
    ...formattedAddress,
    LINE_BREAK,
    new Intl.DisplayNames(locale, { type: "region" }).of(
      address.country,
    ) as string,
  ];

  return fullAddress;
};
