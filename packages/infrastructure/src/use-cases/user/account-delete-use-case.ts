import type {
  AccountDeleteInfra,
  AccountDeleteUseCase,
} from "#root/user/types";

export const accountDeleteUseCase = ({
  accountDeleteInfra,
}: {
  accountDeleteInfra: AccountDeleteInfra;
}): AccountDeleteUseCase => {
  return accountDeleteInfra;
};
