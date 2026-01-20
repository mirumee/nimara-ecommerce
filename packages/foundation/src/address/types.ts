import { type Address } from "@nimara/domain/objects/Address";

export type FormattedAddress = {
  address: Address;
  formattedAddress: string[];
};
