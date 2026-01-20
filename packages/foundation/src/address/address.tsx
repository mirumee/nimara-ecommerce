import React from "react";

import { type Address } from "@nimara/domain/objects/Address";
import { type AddressSchema } from "@nimara/foundation/address/address-form/schema";
import { ADDRESS_CORE_FIELDS } from "@nimara/infrastructure/consts";

import { cleanObject } from "./clean-object";
import { type FormattedAddress } from "./types";

export const schemaToAddress = (
  schema: AddressSchema,
): Partial<Omit<Address, "id">> => schema;

export const addressToSchema = (
  address: Address,
  cleanFields = true,
): AddressSchema => {
  const schema = {
    ...(Object.fromEntries(
      ADDRESS_CORE_FIELDS.map((key) => [key, address[key]]),
    ) as Partial<Address>),
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
