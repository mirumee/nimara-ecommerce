import type {
  UserGetInfra,
  UserGetUseCase,
} from "#root/public/saleor/user/types";

export const userGetUseCase = ({
  userGetInfra,
}: {
  userGetInfra: UserGetInfra;
}): UserGetUseCase => {
  return userGetInfra;
};
