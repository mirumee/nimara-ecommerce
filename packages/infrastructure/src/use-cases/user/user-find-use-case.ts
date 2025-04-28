import type { UserFindInfra, UserFindUseCase } from "#root/user/types";

export const userFindUseCase = ({
  userFindInfra,
}: {
  userFindInfra: UserFindInfra;
}): UserFindUseCase => userFindInfra;
