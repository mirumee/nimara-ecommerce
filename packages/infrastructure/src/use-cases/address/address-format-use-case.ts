import type {
  AddressFormatInfra,
  AddressFormatUseCase,
} from "#root/public/saleor/address/types";

export const addressFormatUseCase = ({
  addressFormatInfra,
}: {
  addressFormatInfra: AddressFormatInfra;
}): AddressFormatUseCase => {
  return addressFormatInfra;
};
