import type { AddressValidationRulesQuery_addressValidationRules_AddressValidationData } from "../../graphql/queries/generated";

export const isAllowed = ({
  addressValidationRules,
  name,
}: {
  addressValidationRules: AddressValidationRulesQuery_addressValidationRules_AddressValidationData;
  name: string;
}) => {
  if (!addressValidationRules) {
    return false;
  }

  return addressValidationRules.allowedFields.some(
    (fieldName) => fieldName === name,
  );
};
