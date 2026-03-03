"use server";

import { type AllCountryCode } from "@nimara/domain/consts";
import {
  type AddressCreateInput,
  type AddressType,
} from "@nimara/domain/objects/Address";

import { getServiceRegistry } from "@/services/registry";

/**
 * Fundamental action to create a new address.
 * Address can be either for shipping or billing.
 * Requires access token.
 * @param param0 Contains the address data and the type of address to create.
 * @returns A promise that resolves to the result of the action.
 */
export const createAddressAction = async ({
  accessToken,
  address,
  type,
}: {
  accessToken: string;
  address: Partial<AddressCreateInput>;
  type: AddressType;
}) => {
  const services = await getServiceRegistry();
  const userService = await services.getUserService();

  const result = await userService.accountAddressCreate({
    accessToken,
    input: {
      city: address.city,
      cityArea: address.cityArea,
      companyName: address.companyName,
      countryArea: address.countryArea,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      postalCode: address.postalCode,
      streetAddress1: address.streetAddress1,
      streetAddress2: address.streetAddress2,
      country: address.country as AllCountryCode,
    },
    type,
  });

  return result;
};
