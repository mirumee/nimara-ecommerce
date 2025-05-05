import type {
  AddressFormatInfra,
  AddressFormatUseCase,
} from "#root/address/types";

export const addressFormatUseCase = ({
  addressFormatInfra,
}: {
  addressFormatInfra: AddressFormatInfra;
}): AddressFormatUseCase => {
  return addressFormatInfra;
};
