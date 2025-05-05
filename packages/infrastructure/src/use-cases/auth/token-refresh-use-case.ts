import type {
  TokenRefreshInfra,
  TokenRefreshUseCase,
} from "../../auth/types.ts";

export const tokenRefreshUseCase = ({
  tokenRefreshInfra,
}: {
  tokenRefreshInfra: TokenRefreshInfra;
}): TokenRefreshUseCase => {
  return tokenRefreshInfra;
};
