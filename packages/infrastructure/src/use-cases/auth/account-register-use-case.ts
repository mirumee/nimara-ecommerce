import type {
  AccountRegisterInfra,
  AccountRegisterUseCase,
} from "#root/public/saleor/auth/types";

export const accountRegisterUseCase = ({
  accountRegisterInfra,
}: {
  accountRegisterInfra: AccountRegisterInfra;
}): AccountRegisterUseCase => {
  return accountRegisterInfra;
};
