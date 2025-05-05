import type {
  ConfirmEmailChangeInfra,
  ConfirmEmailChangeUseCase,
} from "#root/user/types";

export const confirmEmailChangeUseCase = ({
  confirmEmailChangeInfra,
}: {
  confirmEmailChangeInfra: ConfirmEmailChangeInfra;
}): ConfirmEmailChangeUseCase => {
  return confirmEmailChangeInfra;
};
