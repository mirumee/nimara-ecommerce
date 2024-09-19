import type {
  AddressFormGetRowsInfra,
  AddressFormGetRowsUseCase,
} from "#root/public/saleor/address/types";

export const addressFormGetRowsUseCase = ({
  addressFormGetRowsInfra,
}: {
  addressFormGetRowsInfra: AddressFormGetRowsInfra;
}): AddressFormGetRowsUseCase => {
  return addressFormGetRowsInfra;
};
