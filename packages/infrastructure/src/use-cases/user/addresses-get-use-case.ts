import type {
  AddressesGetInfra,
  AddressesGetUseCase,
} from "#root/public/saleor/user/types";

export const addressesGetUseCase = ({
  addressesGetInfra,
}: {
  addressesGetInfra: AddressesGetInfra;
}): AddressesGetUseCase => {
  return addressesGetInfra;
};
