import type {
  AddressFormGetRowsInfra,
  AddressFormGetRowsUseCase,
} from "#root/address/types";

export const addressFormGetRowsUseCase = ({
  addressFormGetRowsInfra,
}: {
  addressFormGetRowsInfra: AddressFormGetRowsInfra;
}): AddressFormGetRowsUseCase => {
  return addressFormGetRowsInfra;
};
