import type {
  UserFindInfra,
  UserFindUseCase,
} from "#root/public/saleor/user/types";

export const userFindUseCase = ({
  userFindInfra,
}: {
  userFindInfra: UserFindInfra;
}): UserFindUseCase => userFindInfra;
