import type {
  FieldType,
  SelectOptions,
} from "@nimara/domain/objects/AddressForm";

import type { AddressValidationRulesQuery_addressValidationRules_AddressValidationData } from "../../../saleor/graphql/queries/generated";
import { camelizeLabel } from "../helpers/camelize-label";
import { isAllowed } from "../helpers/is-allowed";
import { isRequired } from "../helpers/is-required";

const COUNTRY_AREA = "countryArea";

export const getCountryAreaField = ({
  addressValidationRules,
}: {
  addressValidationRules: AddressValidationRulesQuery_addressValidationRules_AddressValidationData;
}) => {
  if (!addressValidationRules) {
    return;
  }
  if (!isAllowed({ name: COUNTRY_AREA, addressValidationRules })) {
    return;
  }

  return [
    {
      name: COUNTRY_AREA,
      type: "select" as FieldType,
      label: camelizeLabel(addressValidationRules.countryAreaType),
      isRequired: isRequired({ name: COUNTRY_AREA, addressValidationRules }),
      options: addressValidationRules.countryAreaChoices.map(
        ({ raw, verbose }) => ({ value: raw, label: verbose }),
      ) as SelectOptions,
    },
  ];
};
