import { type CountryCode } from "@nimara/codegen/schema";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";

import { type AddressValidationRulesQuery_addressValidationRules_AddressValidationData } from "../../saleor/graphql/queries/generated";
import { getCityField } from "./fields/get-city-field";
import { getCountryAreaField } from "./fields/get-country-area-field";
import { getPostalCodeField } from "./fields/get-postal-code-field";
import { getStreetAddressFields } from "./fields/get-street-address-fields";

const COUNTRY_CODES_WITH_COUNTRY_AREA_VALIDATION = [
  "AU",
  "CA",
  "CN",
  "ES",
  "JP",
  "US",
];

export const parseAddressFormRows = ({
  addressValidationRules,
  countryCode,
}: {
  addressValidationRules: AddressValidationRulesQuery_addressValidationRules_AddressValidationData;
  countryCode: CountryCode;
}) => {
  const addressFormRows = addressValidationRules.addressFormat
    .split("%")
    .reduce<AddressFormRow[]>((acc, field) => {
      const fieldKey = Array.from(field)[0];
      const fields = (() => {
        switch (fieldKey) {
          // DOCS: https://docs.saleor.io/docs/3.x/api-storefront/users/objects/address-validation-data
          case "N": // Name
            return; // handled in component
          case "O": // Organization
            return; // not supported in design

          case "A": {
            // Street Address Line(s)
            const streetAddressFields = getStreetAddressFields({
              addressValidationRules,
            });

            if (!streetAddressFields) {
              return;
            }

            return streetAddressFields;
          }
          case "C": {
            // City or Locality
            const cityField = getCityField({
              addressValidationRules,
            });

            if (!cityField) {
              return;
            }

            return [cityField];
          }
          case "S": {
            // Administrative area such as a state, province, island etc
            const hasCountryAreaValidation =
              COUNTRY_CODES_WITH_COUNTRY_AREA_VALIDATION.includes(countryCode);

            if (!hasCountryAreaValidation) {
              return;
            }

            const countryAreaField = getCountryAreaField({
              addressValidationRules,
            });

            if (!countryAreaField) {
              return;
            }

            return [countryAreaField];
          }
          case "Z": {
            // Zip or postal code
            const postalCode = getPostalCodeField({
              addressValidationRules,
            });

            if (!postalCode) {
              return;
            }

            return [postalCode];
          }
          case "D": // NOT SUPPORTED Dependent locality (may be an inner-city district or a suburb)
          default:
            return;
        }
      })();

      return fields ? [...acc, ...fields] : acc;
    }, []);

  return Object.freeze(addressFormRows);
};
