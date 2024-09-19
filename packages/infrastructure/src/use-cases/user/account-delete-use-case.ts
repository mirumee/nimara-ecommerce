import type {
  AccountDeleteInfra,
  AccountDeleteUseCase,
} from "#root/public/saleor/user/types";

export const accountDeleteUseCase = ({
  accountDeleteInfra,
}: {
  accountDeleteInfra: AccountDeleteInfra;
}): AccountDeleteUseCase => {
  return accountDeleteInfra;
};
