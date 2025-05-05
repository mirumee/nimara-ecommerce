import type {
  AccountRequestDeletionInfra,
  AccountRequestDeletionUseCase,
} from "#root/user/types";

export const accountRequestDeletionUseCase = ({
  accountRequestDeletionInfra,
}: {
  accountRequestDeletionInfra: AccountRequestDeletionInfra;
}): AccountRequestDeletionUseCase => {
  return accountRequestDeletionInfra;
};
