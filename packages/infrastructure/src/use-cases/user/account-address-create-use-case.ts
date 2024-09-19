import type {
  AccountAddressCreateInfra,
  AccountAddressCreateUseCase,
} from "#root/public/saleor/user/types";

export const accountAddressCreateUseCase = ({
  accountAddressCreateInfra,
}: {
  accountAddressCreateInfra: AccountAddressCreateInfra;
}): AccountAddressCreateUseCase => {
  return accountAddressCreateInfra;
};
