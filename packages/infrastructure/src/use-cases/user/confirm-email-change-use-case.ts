import type {
  ConfirmEmailChangeInfra,
  ConfirmEmailChangeUseCase,
} from "#root/public/saleor/user/types";

export const confirmEmailChangeUseCase = ({
  confirmEmailChangeInfra,
}: {
  confirmEmailChangeInfra: ConfirmEmailChangeInfra;
}): ConfirmEmailChangeUseCase => {
  return confirmEmailChangeInfra;
};
