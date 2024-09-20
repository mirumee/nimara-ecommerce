import type {
  AccountAddressDeleteInfra,
  AccountAddressDeleteUseCase,
} from "#root/public/saleor/user/types";

export const accountAddressDeleteUseCase = ({
  accountAddressDeleteInfra,
}: {
  accountAddressDeleteInfra: AccountAddressDeleteInfra;
}): AccountAddressDeleteUseCase => {
  return accountAddressDeleteInfra;
};
