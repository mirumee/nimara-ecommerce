import type {
  AccountAddressUpdateInfra,
  AccountAddressUpdateUseCase,
} from "#root/user/types";

export const accountAddressUpdateUseCase = ({
  accountAddressUpdateInfra,
}: {
  accountAddressUpdateInfra: AccountAddressUpdateInfra;
}): AccountAddressUpdateUseCase => {
  return accountAddressUpdateInfra;
};
