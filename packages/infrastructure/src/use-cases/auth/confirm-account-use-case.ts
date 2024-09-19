import type {
  ConfirmAccountInfra,
  ConfirmAccountUseCase,
} from "#root/public/saleor/auth/types";

export const confirmAccountUseCase = ({
  confirmAccountInfra,
}: {
  confirmAccountInfra: ConfirmAccountInfra;
}): ConfirmAccountUseCase => {
  return confirmAccountInfra;
};
