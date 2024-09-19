import type {
  AccountInput,
  AddressInput,
  AddressTypeEnum,
  LanguageCodeEnum,
} from "@nimara/codegen/schema";
import type { Address } from "@nimara/domain/objects/Address";
import type { AccountError, BaseError } from "@nimara/domain/objects/Error";
import type { Order } from "@nimara/domain/objects/Order";
import { type User } from "@nimara/domain/objects/User";

import { type QueryOptions } from "#root/lib/types";

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
}

export type UserGetInfra = (accessToken?: string) => Promise<User | null>;

export type UserGetUseCase = UserGetInfra;

export type OrdersGetInfra = ({
  accessToken,
  languageCode,
}: {
  accessToken: string | undefined;
  languageCode: LanguageCodeEnum;
}) => Promise<Order[] | null>;

export type OrdersGetUseCase = OrdersGetInfra;

export type AccountDeleteInfra = (opts: {
  accessToken: string;
  token: string;
}) => Promise<{ errors: AccountError[] } | null>;

export type AccountDeleteUseCase = AccountDeleteInfra;

export type AccountRequestDeletionInfra = ({
  accessToken,
  channel,
  redirectUrl,
}: {
  accessToken: string | undefined;
  channel: string;
  redirectUrl: string;
}) => Promise<{ errors: AccountError[] } | null>;

export type AccountRequestDeletionUseCase = AccountRequestDeletionInfra;

export type AddressesGetInfra = (
  opts: {
    variables: { accessToken: string | undefined };
  } & QueryOptions,
) => Promise<Address[] | null>;

export type AddressesGetUseCase = AddressesGetInfra;

export type AccountAddressCreateInfra = (opts: {
  accessToken: string | undefined;
  input: AddressInput;
  type?: AddressTypeEnum;
}) => Promise<{
  address: Pick<Address, "id"> | null;
  errors: AccountError[];
} | null>;

export type AccountAddressCreateUseCase = AccountAddressCreateInfra;

export type AccountAddressDeleteInfra = (opts: {
  accessToken: string | undefined;
  id: string;
}) => Promise<{
  errors: AccountError[];
} | null>;

export type AccountAddressDeleteUseCase = AccountAddressDeleteInfra;

export type AccountAddressUpdateInfra = (opts: {
  accessToken: string | undefined;
  id: string;
  input: AddressInput;
}) => Promise<{
  errors: AccountError[];
} | null>;

export type AccountAddressUpdateUseCase = AccountAddressUpdateInfra;

export type AccountSetDefaultAddressInfra = (opts: {
  accessToken: string | undefined;
  id: string;
  type: AddressTypeEnum;
}) => Promise<{ errors: AccountError[] } | null>;

export type AccountSetDefaultAddressUseCase = AccountSetDefaultAddressInfra;

export type AccountUpdateInfra = ({
  accountInput,
  accessToken,
}: {
  accessToken?: string;
  accountInput: AccountInput;
}) => Promise<{ errors: AccountError[]; user: User | null } | null>;

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
}) => Promise<{ errors: AccountError[] } | null>;

export type RequestEmailChangeUseCase = RequestEmailChangeInfra;

export type ConfirmEmailChangeInfra = ({
  accessToken,
  channel,
  token,
}: {
  accessToken: string;
  channel: string;
  token: string;
}) => Promise<{
  errors: AccountError[];
  user: Pick<User, "id" | "email"> | null;
} | null>;

export type ConfirmEmailChangeUseCase = ConfirmEmailChangeInfra;

export type PasswordChangeInfra = ({
  accessToken,
  newPassword,
  oldPassword,
}: {
  accessToken: string;
  newPassword: string;
  oldPassword?: string;
}) => Promise<
  | {
      errors: AccountError[];
      success: false;
    }
  | { serverError: BaseError; success: false }
  | { success: true }
>;

export type PasswordChangeUseCase = PasswordChangeInfra;

export type UserFindInfra = (opts: {
  email: string;
  saleorAppToken: string;
}) => Promise<{ email: string } | null>;

export type UserFindUseCase = UserFindInfra;
