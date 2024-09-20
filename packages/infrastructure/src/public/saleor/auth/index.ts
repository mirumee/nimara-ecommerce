import { accountRegisterUseCase } from "#root/use-cases/auth/account-register-use-case";
import { confirmAccountUseCase } from "#root/use-cases/auth/confirm-account-use-case";
import { passwordSetUseCase } from "#root/use-cases/auth/password-set-use-case";
import { requestPasswordResetUseCase } from "#root/use-cases/auth/request-password-reset-use-case";
import { tokenRefreshUseCase } from "#root/use-cases/auth/token-refresh-use-case";

import { saleorAccountRegisterInfra } from "./infrastructure/account-register-infra";
import { saleorConfirmAccountInfra } from "./infrastructure/confirm-account-infra";
import { saleorPasswordSetInfra } from "./infrastructure/password-set-infra";
import { saleorRequestPasswordResetInfra } from "./infrastructure/request-password-reset-infra";
import { saleorTokenRefreshInfra } from "./infrastructure/token-refresh-infra";
import type { AuthService, SaleorAuthServiceConfig } from "./types";

export const saleorAuthService: AuthService<SaleorAuthServiceConfig> = (
  config,
) => ({
  tokenRefresh: tokenRefreshUseCase({
    tokenRefreshInfra: saleorTokenRefreshInfra(config),
  }),
  accountRegister: accountRegisterUseCase({
    accountRegisterInfra: saleorAccountRegisterInfra(config),
  }),
  confirmAccount: confirmAccountUseCase({
    confirmAccountInfra: saleorConfirmAccountInfra(config),
  }),
  passwordSet: passwordSetUseCase({
    passwordSetInfra: saleorPasswordSetInfra(config),
  }),
  requestPasswordReset: requestPasswordResetUseCase({
    requestPasswordResetInfra: saleorRequestPasswordResetInfra(config),
  }),
});
