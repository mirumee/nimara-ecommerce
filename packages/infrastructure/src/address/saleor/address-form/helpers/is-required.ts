import type { AddressValidationRulesQuery_addressValidationRules_AddressValidationData } from "../../../saleor/graphql/queries/generated";

export const isRequired = ({
  addressValidationRules,
  name,
}: {
  addressValidationRules: AddressValidationRulesQuery_addressValidationRules_AddressValidationData;
  name: string;
}) => {
  if (!addressValidationRules) {
    return false;
  }

  return addressValidationRules.requiredFields.some(
    (fieldName) => fieldName === name,
  );
};
