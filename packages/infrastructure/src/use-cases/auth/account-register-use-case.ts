import type {
  AccountRegisterInfra,
  AccountRegisterUseCase,
} from "../../auth/types.ts";

export const accountRegisterUseCase = ({
  accountRegisterInfra,
}: {
  accountRegisterInfra: AccountRegisterInfra;
}): AccountRegisterUseCase => {
  return accountRegisterInfra;
};
