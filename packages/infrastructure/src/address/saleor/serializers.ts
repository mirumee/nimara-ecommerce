import { type AllCountryCode } from "@nimara/domain/consts";
import { type Address } from "@nimara/domain/objects/Address";

import { type AddressFragment } from "#root/address/saleor/graphql/fragments/generated";

/**
 * Serialize an Saleor AddressFragment to a Address type.
 * @param address - The Saleor AddressFragment to serialize.
 * @returns An Address object with the country code properly typed.
 */
export const serializeAddress = (address: AddressFragment): Address => {
  return {
    ...address,
    country: address.country.code as AllCountryCode,
  };
};
