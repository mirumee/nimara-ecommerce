import type {
  ConfirmAccountInfra,
  ConfirmAccountUseCase,
} from "../../auth/types.ts";

export const confirmAccountUseCase = ({
  confirmAccountInfra,
}: {
  confirmAccountInfra: ConfirmAccountInfra;
}): ConfirmAccountUseCase => {
  return confirmAccountInfra;
};
