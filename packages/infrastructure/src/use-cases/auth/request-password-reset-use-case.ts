import type {
  RequestPasswordResetInfra,
  RequestPasswordResetUseCase,
} from "#root/public/saleor/auth/types";

export const requestPasswordResetUseCase = ({
  requestPasswordResetInfra,
}: {
  requestPasswordResetInfra: RequestPasswordResetInfra;
}): RequestPasswordResetUseCase => {
  return requestPasswordResetInfra;
};
