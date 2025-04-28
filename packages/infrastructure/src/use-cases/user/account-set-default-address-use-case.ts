import type {
  AccountSetDefaultAddressInfra,
  AccountSetDefaultAddressUseCase,
} from "#root/user/types";

export const accountSetDefaultAddressUseCase = ({
  accountSetDefaultAddressInfra,
}: {
  accountSetDefaultAddressInfra: AccountSetDefaultAddressInfra;
}): AccountSetDefaultAddressUseCase => {
  return accountSetDefaultAddressInfra;
};
