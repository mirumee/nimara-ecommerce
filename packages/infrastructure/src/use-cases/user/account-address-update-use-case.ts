import type {
  AccountAddressUpdateInfra,
  AccountAddressUpdateUseCase,
} from "#root/public/saleor/user/types";

export const accountAddressUpdateUseCase = ({
  accountAddressUpdateInfra,
}: {
  accountAddressUpdateInfra: AccountAddressUpdateInfra;
}): AccountAddressUpdateUseCase => {
  return accountAddressUpdateInfra;
};
