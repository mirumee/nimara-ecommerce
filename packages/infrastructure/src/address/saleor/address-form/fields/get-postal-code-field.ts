import type { FieldType } from "@nimara/domain/objects/AddressForm";

import type { AddressValidationRulesQuery_addressValidationRules_AddressValidationData } from "../../../saleor/graphql/queries/generated";
import { camelizeLabel } from "../helpers/camelize-label";
import { isAllowed } from "../helpers/is-allowed";
import { isRequired } from "../helpers/is-required";

const POSTAL_AREA = "postalCode";

export const getPostalCodeField = ({
  addressValidationRules,
}: {
  addressValidationRules: AddressValidationRulesQuery_addressValidationRules_AddressValidationData;
}) => {
  if (!addressValidationRules) {
    return;
  }
  if (!isAllowed({ name: POSTAL_AREA, addressValidationRules })) {
    return;
  }

  return [
    {
      name: POSTAL_AREA,
      type: "text" as FieldType,
      label: camelizeLabel(addressValidationRules.postalCodeType),
      isRequired: isRequired({ name: POSTAL_AREA, addressValidationRules }),
      placeholder: addressValidationRules.postalCodeExamples[0],
      matchers: addressValidationRules.postalCodeMatchers,
    },
  ];
};
