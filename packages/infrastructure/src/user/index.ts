import { accountAddressCreateUseCase } from "#root/use-cases/user/account-address-create-use-case";
import { accountAddressDeleteUseCase } from "#root/use-cases/user/account-address-delete-use-case";
import { accountAddressUpdateUseCase } from "#root/use-cases/user/account-address-update-use-case";
import { accountDeleteUseCase } from "#root/use-cases/user/account-delete-use-case";
import { accountRequestDeletionUseCase } from "#root/use-cases/user/account-request-deletion-use-case";
import { accountSetDefaultAddressUseCase } from "#root/use-cases/user/account-set-default-address-use-case";
import { accountUpdateUseCase } from "#root/use-cases/user/account-update-use-case";
import { addressesGetUseCase } from "#root/use-cases/user/addresses-get-use-case";
import { confirmEmailChangeUseCase } from "#root/use-cases/user/confirm-email-change-use-case";
import { ordersGetUseCase } from "#root/use-cases/user/orders-get-use-case";
import { passwordChangeUseCase } from "#root/use-cases/user/password-change-use-case";
import { requestEmailChangeUseCase } from "#root/use-cases/user/request-email-change-use-case";
import { userFindUseCase } from "#root/use-cases/user/user-find-use-case";
import { userGetUseCase } from "#root/use-cases/user/user-get-use-case";

import { saleorAccountAddressCreateInfra } from "./saleor/infrastructure/account-address-create-infra";
import { saleorAccountAddressDeleteInfra } from "./saleor/infrastructure/account-address-delete-infra";
import { saleorAccountAddressUpdateInfra } from "./saleor/infrastructure/account-address-update-infra";
import { saleorAccountDeleteInfra } from "./saleor/infrastructure/account-delete-infra";
import { saleorAccountRequestDeletionInfra } from "./saleor/infrastructure/account-request-deletion-infra";
import { saleorAccountSetDefaultAddressInfra } from "./saleor/infrastructure/account-set-default-address-infra";
import { saleorAddressesGetInfra } from "./saleor/infrastructure/addresses-get-infra";
import { saleorConfirmEmailChangeInfra } from "./saleor/infrastructure/confirm-email-change-infra";
import { saleorOrdersGetInfra } from "./saleor/infrastructure/orders-get-infra";
import { saleorPasswordChangeInfra } from "./saleor/infrastructure/password-change-infra";
import { saleorRequestEmailChangeInfra } from "./saleor/infrastructure/request-email-change-infra";
import { saleorUserFindInfra } from "./saleor/infrastructure/user-find-infra";
import { saleorUserGetInfra } from "./saleor/infrastructure/user-get-infra";
import { saleorAccountUpdateInfra } from "./saleor/infrastructure/user-update-infra";
import type { SaleorUserServiceConfig, UserService } from "./types";

export const saleorUserService: UserService<SaleorUserServiceConfig> = (
  config,
) => ({
  accountAddressCreate: accountAddressCreateUseCase({
    accountAddressCreateInfra: saleorAccountAddressCreateInfra(config),
  }),
  accountAddressDelete: accountAddressDeleteUseCase({
    accountAddressDeleteInfra: saleorAccountAddressDeleteInfra(config),
  }),
  accountAddressUpdate: accountAddressUpdateUseCase({
    accountAddressUpdateInfra: saleorAccountAddressUpdateInfra(config),
  }),
  accountSetDefaultAddress: accountSetDefaultAddressUseCase({
    accountSetDefaultAddressInfra: saleorAccountSetDefaultAddressInfra(config),
  }),
  ordersGet: ordersGetUseCase({
    ordersGetInfra: saleorOrdersGetInfra(config),
  }),
  accountRequestDeletion: accountRequestDeletionUseCase({
    accountRequestDeletionInfra: saleorAccountRequestDeletionInfra(config),
  }),
  accountDelete: accountDeleteUseCase({
    accountDeleteInfra: saleorAccountDeleteInfra(config),
  }),
  addressesGet: addressesGetUseCase({
    addressesGetInfra: saleorAddressesGetInfra(config),
  }),
  userGet: userGetUseCase({
    userGetInfra: saleorUserGetInfra(config),
  }),
  accountUpdate: accountUpdateUseCase({
    accountUpdateInfra: saleorAccountUpdateInfra(config),
  }),
  requestEmailChange: requestEmailChangeUseCase({
    requestEmailChangeInfra: saleorRequestEmailChangeInfra(config),
  }),
  confirmEmailChange: confirmEmailChangeUseCase({
    confirmEmailChangeInfra: saleorConfirmEmailChangeInfra(config),
  }),
  passwordChange: passwordChangeUseCase({
    passwordChangeInfra: saleorPasswordChangeInfra(config),
  }),
  userFind: userFindUseCase({
    userFindInfra: saleorUserFindInfra(config),
  }),
});
