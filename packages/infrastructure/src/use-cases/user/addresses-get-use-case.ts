import type { AddressesGetInfra, AddressesGetUseCase } from "#root/user/types";

export const addressesGetUseCase = ({
  addressesGetInfra,
}: {
  addressesGetInfra: AddressesGetInfra;
}): AddressesGetUseCase => {
  return addressesGetInfra;
};
