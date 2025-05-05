import type {
  AccountAddressCreateInfra,
  AccountAddressCreateUseCase,
} from "#root/user/types";

export const accountAddressCreateUseCase = ({
  accountAddressCreateInfra,
}: {
  accountAddressCreateInfra: AccountAddressCreateInfra;
}): AccountAddressCreateUseCase => {
  return accountAddressCreateInfra;
};
