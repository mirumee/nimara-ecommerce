import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AccountAddressCreateMutation_accountAddressCreate_AccountAddressCreate_address_Address = { id: string };

export type AccountAddressCreateMutation_accountAddressCreate_AccountAddressCreate_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type AccountAddressCreateMutation_accountAddressCreate_AccountAddressCreate = { address: AccountAddressCreateMutation_accountAddressCreate_AccountAddressCreate_address_Address | null, errors: Array<AccountAddressCreateMutation_accountAddressCreate_AccountAddressCreate_errors_AccountError> };

export type AccountAddressCreateMutation_Mutation = { accountAddressCreate: AccountAddressCreateMutation_accountAddressCreate_AccountAddressCreate | null };


export type AccountAddressCreateMutationVariables = Types.Exact<{
  input: Types.AddressInput;
  type?: Types.InputMaybe<Types.AddressTypeEnum>;
}>;


export type AccountAddressCreateMutation = AccountAddressCreateMutation_Mutation;

export type AccountAddressDeleteMutation_accountAddressDelete_AccountAddressDelete_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type AccountAddressDeleteMutation_accountAddressDelete_AccountAddressDelete = { errors: Array<AccountAddressDeleteMutation_accountAddressDelete_AccountAddressDelete_errors_AccountError> };

export type AccountAddressDeleteMutation_Mutation = { accountAddressDelete: AccountAddressDeleteMutation_accountAddressDelete_AccountAddressDelete | null };


export type AccountAddressDeleteMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type AccountAddressDeleteMutation = AccountAddressDeleteMutation_Mutation;

export type AccountAddressUpdateMutation_accountAddressUpdate_AccountAddressUpdate_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type AccountAddressUpdateMutation_accountAddressUpdate_AccountAddressUpdate = { errors: Array<AccountAddressUpdateMutation_accountAddressUpdate_AccountAddressUpdate_errors_AccountError> };

export type AccountAddressUpdateMutation_Mutation = { accountAddressUpdate: AccountAddressUpdateMutation_accountAddressUpdate_AccountAddressUpdate | null };


export type AccountAddressUpdateMutationVariables = Types.Exact<{
  input: Types.AddressInput;
  id: Types.Scalars['ID']['input'];
}>;


export type AccountAddressUpdateMutation = AccountAddressUpdateMutation_Mutation;

export type AccountDeleteMutation_accountDelete_AccountDelete_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type AccountDeleteMutation_accountDelete_AccountDelete = { errors: Array<AccountDeleteMutation_accountDelete_AccountDelete_errors_AccountError> };

export type AccountDeleteMutation_Mutation = { accountDelete: AccountDeleteMutation_accountDelete_AccountDelete | null };


export type AccountDeleteMutationVariables = Types.Exact<{
  token: Types.Scalars['String']['input'];
}>;


export type AccountDeleteMutation = AccountDeleteMutation_Mutation;

export type AccountRequestDeletionMutation_accountRequestDeletion_AccountRequestDeletion_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type AccountRequestDeletionMutation_accountRequestDeletion_AccountRequestDeletion = { errors: Array<AccountRequestDeletionMutation_accountRequestDeletion_AccountRequestDeletion_errors_AccountError> };

export type AccountRequestDeletionMutation_Mutation = { accountRequestDeletion: AccountRequestDeletionMutation_accountRequestDeletion_AccountRequestDeletion | null };


export type AccountRequestDeletionMutationVariables = Types.Exact<{
  channel?: Types.InputMaybe<Types.Scalars['String']['input']>;
  redirectUrl: Types.Scalars['String']['input'];
}>;


export type AccountRequestDeletionMutation = AccountRequestDeletionMutation_Mutation;

export type AccountSetDefaultAddressMutation_accountSetDefaultAddress_AccountSetDefaultAddress_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type AccountSetDefaultAddressMutation_accountSetDefaultAddress_AccountSetDefaultAddress = { errors: Array<AccountSetDefaultAddressMutation_accountSetDefaultAddress_AccountSetDefaultAddress_errors_AccountError> };

export type AccountSetDefaultAddressMutation_Mutation = { accountSetDefaultAddress: AccountSetDefaultAddressMutation_accountSetDefaultAddress_AccountSetDefaultAddress | null };


export type AccountSetDefaultAddressMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  type: Types.AddressTypeEnum;
}>;


export type AccountSetDefaultAddressMutation = AccountSetDefaultAddressMutation_Mutation;

export type AccountUpdateMutation_accountUpdate_AccountUpdate_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type AccountUpdateMutation_accountUpdate_AccountUpdate_user_User_metadata_MetadataItem = { key: string, value: string };

export type AccountUpdateMutation_accountUpdate_AccountUpdate_user_User = { id: string, email: string, firstName: string, lastName: string, checkoutIds: Array<string> | null, metadata: Array<AccountUpdateMutation_accountUpdate_AccountUpdate_user_User_metadata_MetadataItem> };

export type AccountUpdateMutation_accountUpdate_AccountUpdate = { errors: Array<AccountUpdateMutation_accountUpdate_AccountUpdate_errors_AccountError>, user: AccountUpdateMutation_accountUpdate_AccountUpdate_user_User | null };

export type AccountUpdateMutation_Mutation = { accountUpdate: AccountUpdateMutation_accountUpdate_AccountUpdate | null };


export type AccountUpdateMutationVariables = Types.Exact<{
  accountInput: Types.AccountInput;
}>;


export type AccountUpdateMutation = AccountUpdateMutation_Mutation;

export type ConfirmEmailChangeMutation_confirmEmailChange_ConfirmEmailChange_user_User = { id: string, email: string };

export type ConfirmEmailChangeMutation_confirmEmailChange_ConfirmEmailChange_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type ConfirmEmailChangeMutation_confirmEmailChange_ConfirmEmailChange = { user: ConfirmEmailChangeMutation_confirmEmailChange_ConfirmEmailChange_user_User | null, errors: Array<ConfirmEmailChangeMutation_confirmEmailChange_ConfirmEmailChange_errors_AccountError> };

export type ConfirmEmailChangeMutation_Mutation = { confirmEmailChange: ConfirmEmailChangeMutation_confirmEmailChange_ConfirmEmailChange | null };


export type ConfirmEmailChangeMutationVariables = Types.Exact<{
  channel?: Types.InputMaybe<Types.Scalars['String']['input']>;
  token: Types.Scalars['String']['input'];
}>;


export type ConfirmEmailChangeMutation = ConfirmEmailChangeMutation_Mutation;

export type PasswordChangeMutation_passwordChange_PasswordChange_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type PasswordChangeMutation_passwordChange_PasswordChange = { errors: Array<PasswordChangeMutation_passwordChange_PasswordChange_errors_AccountError> };

export type PasswordChangeMutation_Mutation = { passwordChange: PasswordChangeMutation_passwordChange_PasswordChange | null };


export type PasswordChangeMutationVariables = Types.Exact<{
  newPassword: Types.Scalars['String']['input'];
  oldPassword?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type PasswordChangeMutation = PasswordChangeMutation_Mutation;

export type RequestEmailChangeMutation_requestEmailChange_RequestEmailChange_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type RequestEmailChangeMutation_requestEmailChange_RequestEmailChange = { errors: Array<RequestEmailChangeMutation_requestEmailChange_RequestEmailChange_errors_AccountError> };

export type RequestEmailChangeMutation_Mutation = { requestEmailChange: RequestEmailChangeMutation_requestEmailChange_RequestEmailChange | null };


export type RequestEmailChangeMutationVariables = Types.Exact<{
  channel?: Types.InputMaybe<Types.Scalars['String']['input']>;
  newEmail: Types.Scalars['String']['input'];
  password: Types.Scalars['String']['input'];
  redirectUrl: Types.Scalars['String']['input'];
}>;


export type RequestEmailChangeMutation = RequestEmailChangeMutation_Mutation;

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const AccountAddressCreateMutationDocument = new TypedDocumentString(`
    mutation AccountAddressCreateMutation($input: AddressInput!, $type: AddressTypeEnum) {
  accountAddressCreate(input: $input, type: $type) {
    address {
      id
    }
    errors {
      ...AccountErrorFragment
    }
  }
}
    fragment AccountErrorFragment on AccountError {
  field
  message
  code
  addressType
}`) as unknown as TypedDocumentString<AccountAddressCreateMutation, AccountAddressCreateMutationVariables>;
export const AccountAddressDeleteMutationDocument = new TypedDocumentString(`
    mutation AccountAddressDeleteMutation($id: ID!) {
  accountAddressDelete(id: $id) {
    errors {
      ...AccountErrorFragment
    }
  }
}
    fragment AccountErrorFragment on AccountError {
  field
  message
  code
  addressType
}`) as unknown as TypedDocumentString<AccountAddressDeleteMutation, AccountAddressDeleteMutationVariables>;
export const AccountAddressUpdateMutationDocument = new TypedDocumentString(`
    mutation AccountAddressUpdateMutation($input: AddressInput!, $id: ID!) {
  accountAddressUpdate(input: $input, id: $id) {
    errors {
      ...AccountErrorFragment
    }
  }
}
    fragment AccountErrorFragment on AccountError {
  field
  message
  code
  addressType
}`) as unknown as TypedDocumentString<AccountAddressUpdateMutation, AccountAddressUpdateMutationVariables>;
export const AccountDeleteMutationDocument = new TypedDocumentString(`
    mutation AccountDeleteMutation($token: String!) {
  accountDelete(token: $token) {
    errors {
      ...AccountErrorFragment
    }
  }
}
    fragment AccountErrorFragment on AccountError {
  field
  message
  code
  addressType
}`) as unknown as TypedDocumentString<AccountDeleteMutation, AccountDeleteMutationVariables>;
export const AccountRequestDeletionMutationDocument = new TypedDocumentString(`
    mutation AccountRequestDeletionMutation($channel: String, $redirectUrl: String!) {
  accountRequestDeletion(channel: $channel, redirectUrl: $redirectUrl) {
    errors {
      ...AccountErrorFragment
    }
  }
}
    fragment AccountErrorFragment on AccountError {
  field
  message
  code
  addressType
}`) as unknown as TypedDocumentString<AccountRequestDeletionMutation, AccountRequestDeletionMutationVariables>;
export const AccountSetDefaultAddressMutationDocument = new TypedDocumentString(`
    mutation AccountSetDefaultAddressMutation($id: ID!, $type: AddressTypeEnum!) {
  accountSetDefaultAddress(id: $id, type: $type) {
    errors {
      ...AccountErrorFragment
    }
  }
}
    fragment AccountErrorFragment on AccountError {
  field
  message
  code
  addressType
}`) as unknown as TypedDocumentString<AccountSetDefaultAddressMutation, AccountSetDefaultAddressMutationVariables>;
export const AccountUpdateMutationDocument = new TypedDocumentString(`
    mutation AccountUpdateMutation($accountInput: AccountInput!) {
  accountUpdate(input: $accountInput) {
    errors {
      ...AccountErrorFragment
    }
    user {
      ...UserFragment
    }
  }
}
    fragment AccountErrorFragment on AccountError {
  field
  message
  code
  addressType
}
fragment UserFragment on User {
  id
  email
  firstName
  lastName
  metadata {
    ...MetadataItemFragment
  }
  checkoutIds
}
fragment MetadataItemFragment on MetadataItem {
  key
  value
}`) as unknown as TypedDocumentString<AccountUpdateMutation, AccountUpdateMutationVariables>;
export const ConfirmEmailChangeMutationDocument = new TypedDocumentString(`
    mutation ConfirmEmailChangeMutation($channel: String, $token: String!) {
  confirmEmailChange(channel: $channel, token: $token) {
    user {
      id
      email
    }
    errors {
      ...AccountErrorFragment
    }
  }
}
    fragment AccountErrorFragment on AccountError {
  field
  message
  code
  addressType
}`) as unknown as TypedDocumentString<ConfirmEmailChangeMutation, ConfirmEmailChangeMutationVariables>;
export const PasswordChangeMutationDocument = new TypedDocumentString(`
    mutation PasswordChangeMutation($newPassword: String!, $oldPassword: String) {
  passwordChange(newPassword: $newPassword, oldPassword: $oldPassword) {
    errors {
      ...AccountErrorFragment
    }
  }
}
    fragment AccountErrorFragment on AccountError {
  field
  message
  code
  addressType
}`) as unknown as TypedDocumentString<PasswordChangeMutation, PasswordChangeMutationVariables>;
export const RequestEmailChangeMutationDocument = new TypedDocumentString(`
    mutation RequestEmailChangeMutation($channel: String, $newEmail: String!, $password: String!, $redirectUrl: String!) {
  requestEmailChange(
    channel: $channel
    password: $password
    newEmail: $newEmail
    redirectUrl: $redirectUrl
  ) {
    errors {
      ...AccountErrorFragment
    }
  }
}
    fragment AccountErrorFragment on AccountError {
  field
  message
  code
  addressType
}`) as unknown as TypedDocumentString<RequestEmailChangeMutation, RequestEmailChangeMutationVariables>;