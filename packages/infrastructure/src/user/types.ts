import type {
  AccountInput,
  AddressInput,
  AddressTypeEnum,
  LanguageCodeEnum,
} from "@nimara/codegen/schema";
import type { Address } from "@nimara/domain/objects/Address";
import type { Order } from "@nimara/domain/objects/Order";
import { type AsyncResult } from "@nimara/domain/objects/Result";
import { type User } from "@nimara/domain/objects/User";

import { type FetchOptions } from "#root/graphql/client";
import { type QueryOptions } from "#root/lib/types";
import { type Logger } from "#root/logging/types";

export type UserService<Config> = (config: Config) => {
  accountAddressCreate: AccountAddressCreateUseCase;
  accountAddressDelete: AccountAddressDeleteUseCase;
  accountAddressUpdate: AccountAddressUpdateUseCase;
  accountDelete: AccountDeleteUseCase;
  accountRequestDeletion: AccountRequestDeletionUseCase;
  accountSetDefaultAddress: AccountSetDefaultAddressUseCase;
  accountUpdate: AccountUpdateUseCase;
  addressesGet: AddressesGetUseCase;
  confirmEmailChange: ConfirmEmailChangeUseCase;
  ordersGet: OrdersGetUseCase;
  passwordChange: PasswordChangeUseCase;
  requestEmailChange: RequestEmailChangeUseCase;
  userFind: UserFindUseCase;
  userGet: UserGetUseCase;
};

export interface SaleorUserServiceConfig {
  apiURL: string;
  logger: Logger;
}

export type UserGetInfra = (accessToken?: string) => AsyncResult<User | null>;

export type UserGetUseCase = UserGetInfra;

export type OrdersGetInfra = ({
  accessToken,
  languageCode,
}: {
  accessToken: string | undefined;
  languageCode: LanguageCodeEnum;
}) => AsyncResult<Order[]>;

export type OrdersGetUseCase = OrdersGetInfra;

export type AccountDeleteInfra = (opts: {
  accessToken: string;
  token: string;
}) => AsyncResult<{ success: true }>;

export type AccountDeleteUseCase = AccountDeleteInfra;

export type AccountRequestDeletionInfra = ({
  accessToken,
  channel,
  redirectUrl,
}: {
  accessToken: string | undefined;
  channel: string;
  redirectUrl: string;
}) => AsyncResult<{ success: true }>;

export type AccountRequestDeletionUseCase = AccountRequestDeletionInfra;

export type AddressesGetInfra = (
  opts: {
    options?: FetchOptions;
    variables: { accessToken: string | undefined };
  } & QueryOptions,
) => AsyncResult<Address[] | null>;

export type AddressesGetUseCase = AddressesGetInfra;

export type AccountAddressCreateInfra = (opts: {
  accessToken: string | undefined;
  input: AddressInput;
  type?: AddressTypeEnum;
}) => AsyncResult<{ id: string }>;

export type AccountAddressCreateUseCase = AccountAddressCreateInfra;

export type AccountAddressDeleteInfra = (opts: {
  accessToken: string | undefined;
  id: string;
}) => AsyncResult<{ success: true }>;

export type AccountAddressDeleteUseCase = AccountAddressDeleteInfra;

export type AccountAddressUpdateInfra = (opts: {
  accessToken: string | undefined;
  id: string;
  input: AddressInput;
}) => AsyncResult<{ success: true }>;

export type AccountAddressUpdateUseCase = AccountAddressUpdateInfra;

export type AccountSetDefaultAddressInfra = (opts: {
  accessToken: string | undefined;
  id: string;
  type: AddressTypeEnum;
}) => AsyncResult<{ success: true }>;

export type AccountSetDefaultAddressUseCase = AccountSetDefaultAddressInfra;

export type AccountUpdateInfra = ({
  accountInput,
  accessToken,
}: {
  accessToken?: string;
  accountInput: AccountInput;
}) => AsyncResult<User>;

export type AccountUpdateUseCase = AccountUpdateInfra;

export type RequestEmailChangeInfra = ({
  accessToken,
  channel,
  newEmail,
  password,
  redirectUrl,
}: {
  accessToken: string;
  channel: string;
  newEmail: string;
  password: string;
  redirectUrl: string;
}) => AsyncResult<{ success: true }>;

export type RequestEmailChangeUseCase = RequestEmailChangeInfra;

export type ConfirmEmailChangeInfra = ({
  accessToken,
  channel,
  token,
}: {
  accessToken: string;
  channel: string;
  token: string;
}) => AsyncResult<{
  user: Pick<User, "id" | "email"> | null;
}>;

export type ConfirmEmailChangeUseCase = ConfirmEmailChangeInfra;

export type PasswordChangeInfra = ({
  accessToken,
  newPassword,
  oldPassword,
}: {
  accessToken: string;
  newPassword: string;
  oldPassword?: string;
}) => AsyncResult<true>;

export type PasswordChangeUseCase = PasswordChangeInfra;

export type UserFindInfra = (opts: {
  email: string;
  saleorAppToken: string;
}) => AsyncResult<{
  user: Pick<User, "id" | "email"> | null;
}>;

export type UserFindUseCase = UserFindInfra;
