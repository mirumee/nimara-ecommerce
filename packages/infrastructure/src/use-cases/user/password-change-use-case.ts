import type {
  PasswordChangeInfra,
  PasswordChangeUseCase,
} from "#root/public/saleor/user/types";

export const passwordChangeUseCase = ({
  passwordChangeInfra,
}: {
  passwordChangeInfra: PasswordChangeInfra;
}): PasswordChangeUseCase => {
  return passwordChangeInfra;
};
