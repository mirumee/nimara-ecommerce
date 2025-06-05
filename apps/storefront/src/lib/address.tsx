import pick from "lodash/pick";

import { type Address } from "@nimara/domain/objects/Address";
import { ADDRESS_CORE_FIELDS } from "@nimara/infrastructure/consts";

import { type AddressSchema } from "@/components/address-form/schema";
import { type FormattedAddress } from "@/lib/checkout";
import { cleanObject } from "@/lib/core";

export const schemaToAddress = (
  schema: AddressSchema,
): Partial<Omit<Address, "id">> => schema;

export const addressToSchema = (
  address: Address,
  cleanFields = true,
): AddressSchema => {
  const schema = {
    ...pick(address, ADDRESS_CORE_FIELDS),
    country: address?.country ?? "",
  };

  return (cleanFields ? cleanObject(schema) : schema) as AddressSchema;
};

export function displayFormattedAddressLines({
  formattedAddress,
  addressId,
}: {
  addressId: Address["id"];
  formattedAddress: FormattedAddress["formattedAddress"];
}) {
  return formattedAddress?.map((chunk, index) =>
    chunk === "\n" && index !== 1 ? (
      <br key={`${addressId}_${index}`} />
    ) : index === 0 ? (
      <p className="pb-2" key={`${addressId}_${index}`}>
        {chunk}
      </p>
    ) : (
      index !== 1 && <span key={`${addressId}_${index}`}>{chunk}</span>
    ),
  );
}
