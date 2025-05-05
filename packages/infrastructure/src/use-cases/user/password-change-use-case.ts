import type {
  PasswordChangeInfra,
  PasswordChangeUseCase,
} from "#root/user/types";

export const passwordChangeUseCase = ({
  passwordChangeInfra,
}: {
  passwordChangeInfra: PasswordChangeInfra;
}): PasswordChangeUseCase => {
  return passwordChangeInfra;
};
