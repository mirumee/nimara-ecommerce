import type { AccountRegisterInput } from "@nimara/codegen/schema";
import type { AccountError, BaseError } from "@nimara/domain/objects/Error";
import type { RefreshToken } from "@nimara/domain/objects/User";

export type AuthService<Config> = (config: Config) => {
  accountRegister: AccountRegisterUseCase;
  confirmAccount: ConfirmAccountUseCase;
  passwordSet: PasswordSetUseCase;
  requestPasswordReset: RequestPasswordResetUseCase;
  tokenRefresh: TokenRefreshUseCase;
};

export interface SaleorAuthServiceConfig {
  apiURL: string;
}

export type TokenRefreshInfra = ({
  refreshToken,
  accessToken,
}: {
  accessToken?: string;
  refreshToken: string;
}) => Promise<RefreshToken>;

export type TokenRefreshUseCase = TokenRefreshInfra;

export type AccountRegisterInfra = (
  accountRegisterInput: AccountRegisterInput,
) => Promise<{ errors: AccountError[] } | null>;

export type AccountRegisterUseCase = AccountRegisterInfra;

export type PasswordSetInfra = ({
  email,
  password,
  token,
}: {
  email: string;
  password: string;
  token: string;
}) => Promise<{ errors: AccountError[] } | null>;

export type PasswordSetUseCase = PasswordSetInfra;

export type RequestPasswordResetInfra = ({
  email,
  channel,
  redirectUrl,
}: {
  channel: string;
  email: string;
  redirectUrl: string;
}) => Promise<{ errors: AccountError[] } | null>;

export type RequestPasswordResetUseCase = RequestPasswordResetInfra;

export type ConfirmAccountInfra = ({
  email,
  token,
}: {
  email: string;
  token: string;
}) => Promise<
  | { errors: AccountError[]; isSuccess: false }
  | { isSuccess: false; serverError: BaseError }
  | { isSuccess: true }
>;

export type ConfirmAccountUseCase = ConfirmAccountInfra;
