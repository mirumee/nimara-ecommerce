import type {
  AccountUpdateInfra,
  AccountUpdateUseCase,
} from "#root/user/types";

export const accountUpdateUseCase = ({
  accountUpdateInfra,
}: {
  accountUpdateInfra: AccountUpdateInfra;
}): AccountUpdateUseCase => {
  return accountUpdateInfra;
};
