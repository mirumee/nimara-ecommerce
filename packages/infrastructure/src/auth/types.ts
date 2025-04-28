import type { AccountRegisterInput } from "@nimara/codegen/schema";
import { type AsyncResult } from "@nimara/domain/objects/Result";

import { type Logger } from "#root/logging/types";

export type AuthService<Config> = (config: Config) => {
  accountRegister: AccountRegisterUseCase;
  confirmAccount: ConfirmAccountUseCase;
  passwordSet: PasswordSetUseCase;
  requestPasswordReset: RequestPasswordResetUseCase;
  tokenRefresh: TokenRefreshUseCase;
};

export interface SaleorAuthServiceConfig {
  apiURL: string;
  logger: Logger;
}

export type TokenRefreshInfra = (opts: {
  refreshToken: string;
}) => AsyncResult<{ refreshToken: string | null }>;

export type TokenRefreshUseCase = TokenRefreshInfra;

export type AccountRegisterInfra = (
  accountRegisterInput: AccountRegisterInput,
) => AsyncResult<{ success: true }>;

export type AccountRegisterUseCase = AccountRegisterInfra;

export type PasswordSetInfra = (opts: {
  email: string;
  password: string;
  token: string;
}) => AsyncResult<{ success: true }>;

export type PasswordSetUseCase = PasswordSetInfra;

export type RequestPasswordResetInfra = (opts: {
  channel: string;
  email: string;
  redirectUrl: string;
}) => AsyncResult<{ success: true }>;

export type RequestPasswordResetUseCase = RequestPasswordResetInfra;

export type ConfirmAccountInfra = (opts: {
  email: string;
  token: string;
}) => AsyncResult<{ success: true }>;

export type ConfirmAccountUseCase = ConfirmAccountInfra;
