import type { FieldType } from "@nimara/domain/objects/AddressForm";

import type { AddressValidationRulesQuery_addressValidationRules_AddressValidationData } from "../../../saleor/graphql/queries/generated";
import { camelizeLabel } from "../helpers/camelize-label";
import { isAllowed } from "../helpers/is-allowed";
import { isRequired } from "../helpers/is-required";

const CITY = "city";

export const getCityField = ({
  addressValidationRules,
}: {
  addressValidationRules: AddressValidationRulesQuery_addressValidationRules_AddressValidationData;
}) => {
  if (!addressValidationRules) {
    return;
  }
  if (!isAllowed({ name: CITY, addressValidationRules })) {
    return;
  }

  return [
    {
      name: CITY,
      type: "text" as FieldType,
      label: camelizeLabel(addressValidationRules.cityType),
      isRequired: isRequired({ name: CITY, addressValidationRules }),
    },
  ];
};
