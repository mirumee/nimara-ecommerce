import type { FieldType } from "@nimara/domain/objects/AddressForm";

import type { AddressValidationRulesQuery_addressValidationRules_AddressValidationData } from "../../../saleor/graphql/queries/generated";
import { isAllowed } from "../helpers/is-allowed";
import { isRequired } from "../helpers/is-required";

const STREET_ADDRES_1 = "streetAddress1";
const STREET_ADDRES_2 = "streetAddress2";

export const getStreetAddressFields = ({
  addressValidationRules,
}: {
  addressValidationRules: AddressValidationRulesQuery_addressValidationRules_AddressValidationData;
}) => {
  if (!addressValidationRules) {
    return;
  }
  if (!isAllowed({ name: STREET_ADDRES_1, addressValidationRules })) {
    return;
  }

  return [
    [
      {
        name: STREET_ADDRES_1,
        type: "text" as FieldType,
        isRequired: isRequired({
          name: STREET_ADDRES_1,
          addressValidationRules,
        }),
      },
    ],
    [
      {
        name: STREET_ADDRES_2,
        type: "text" as FieldType,
        isRequired: isRequired({
          name: STREET_ADDRES_2,
          addressValidationRules,
        }),
      },
    ],
  ];
};
