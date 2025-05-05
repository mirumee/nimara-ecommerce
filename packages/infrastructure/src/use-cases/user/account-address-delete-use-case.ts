import type {
  AccountAddressDeleteInfra,
  AccountAddressDeleteUseCase,
} from "#root/user/types";

export const accountAddressDeleteUseCase = ({
  accountAddressDeleteInfra,
}: {
  accountAddressDeleteInfra: AccountAddressDeleteInfra;
}): AccountAddressDeleteUseCase => {
  return accountAddressDeleteInfra;
};
