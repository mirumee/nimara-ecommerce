import type {
  AccountUpdateInfra,
  AccountUpdateUseCase,
} from "#root/public/saleor/user/types";

export const accountUpdateUseCase = ({
  accountUpdateInfra,
}: {
  accountUpdateInfra: AccountUpdateInfra;
}): AccountUpdateUseCase => {
  return accountUpdateInfra;
};
