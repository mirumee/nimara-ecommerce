import type {
  PasswordSetInfra,
  PasswordSetUseCase,
} from "#root/public/saleor/auth/types";

export const passwordSetUseCase = ({
  passwordSetInfra,
}: {
  passwordSetInfra: PasswordSetInfra;
}): PasswordSetUseCase => {
  return passwordSetInfra;
};
