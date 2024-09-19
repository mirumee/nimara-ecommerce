import type {
  AccountSetDefaultAddressInfra,
  AccountSetDefaultAddressUseCase,
} from "#root/public/saleor/user/types";

export const accountSetDefaultAddressUseCase = ({
  accountSetDefaultAddressInfra,
}: {
  accountSetDefaultAddressInfra: AccountSetDefaultAddressInfra;
}): AccountSetDefaultAddressUseCase => {
  return accountSetDefaultAddressInfra;
};
