import type { UserGetInfra, UserGetUseCase } from "#root/user/types";

export const userGetUseCase = ({
  userGetInfra,
}: {
  userGetInfra: UserGetInfra;
}): UserGetUseCase => {
  return userGetInfra;
};
