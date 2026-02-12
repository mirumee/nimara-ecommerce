import { type AllCountryCode } from "@nimara/domain/consts";
import { type Address } from "@nimara/domain/objects/Address";
import { type AddressSchema } from "@nimara/foundation/address/address-form/schema";

type AddressCoreDefaults = Pick<
  AddressSchema,
  | "city"
  | "companyName"
  | "country"
  | "countryArea"
  | "firstName"
  | "lastName"
  | "phone"
  | "postalCode"
  | "streetAddress1"
  | "streetAddress2"
>;

interface GetAddressFormDefaultValuesPayload {
  address?: Address | null;
  countryCode: AllCountryCode;
}

export const getAddressFormDefaultValues = ({
  address,
  countryCode,
}: GetAddressFormDefaultValuesPayload): AddressCoreDefaults => {
  return {
    city: address?.city ?? "",
    companyName: address?.companyName ?? "",
    country: address?.country ?? countryCode,
    countryArea: address?.countryArea ?? "",
    firstName: address?.firstName ?? "",
    lastName: address?.lastName ?? "",
    phone: address?.phone ?? "",
    postalCode: address?.postalCode ?? "",
    streetAddress1: address?.streetAddress1 ?? "",
    streetAddress2: address?.streetAddress2 ?? "",
  };
};
