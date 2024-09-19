import type {
  TokenRefreshInfra,
  TokenRefreshUseCase,
} from "#root/public/saleor/auth/types";

export const tokenRefreshUseCase = ({
  tokenRefreshInfra,
}: {
  tokenRefreshInfra: TokenRefreshInfra;
}): TokenRefreshUseCase => {
  return tokenRefreshInfra;
};
