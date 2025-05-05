import type {
  RequestPasswordResetInfra,
  RequestPasswordResetUseCase,
} from "../../auth/types.ts";

export const requestPasswordResetUseCase = ({
  requestPasswordResetInfra,
}: {
  requestPasswordResetInfra: RequestPasswordResetInfra;
}): RequestPasswordResetUseCase => {
  return requestPasswordResetInfra;
};
