import type {
  AccountRequestDeletionInfra,
  AccountRequestDeletionUseCase,
} from "#root/public/saleor/user/types";

export const accountRequestDeletionUseCase = ({
  accountRequestDeletionInfra,
}: {
  accountRequestDeletionInfra: AccountRequestDeletionInfra;
}): AccountRequestDeletionUseCase => {
  return accountRequestDeletionInfra;
};
