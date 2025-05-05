import type { PasswordSetInfra, PasswordSetUseCase } from "../../auth/types.ts";

export const passwordSetUseCase = ({
  passwordSetInfra,
}: {
  passwordSetInfra: PasswordSetInfra;
}): PasswordSetUseCase => {
  return passwordSetInfra;
};
