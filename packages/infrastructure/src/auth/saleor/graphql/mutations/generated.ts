import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AccountRegisterMutation_accountRegister_AccountRegister_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type AccountRegisterMutation_accountRegister_AccountRegister = { errors: Array<AccountRegisterMutation_accountRegister_AccountRegister_errors_AccountError> };

export type AccountRegisterMutation_Mutation = { accountRegister: AccountRegisterMutation_accountRegister_AccountRegister | null };


export type AccountRegisterMutationVariables = Types.Exact<{
  accountRegisterInput: Types.AccountRegisterInput;
}>;


export type AccountRegisterMutation = AccountRegisterMutation_Mutation;

export type ConfirmAccountMutation_confirmAccount_ConfirmAccount_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type ConfirmAccountMutation_confirmAccount_ConfirmAccount = { errors: Array<ConfirmAccountMutation_confirmAccount_ConfirmAccount_errors_AccountError> };

export type ConfirmAccountMutation_Mutation = { confirmAccount: ConfirmAccountMutation_confirmAccount_ConfirmAccount | null };


export type ConfirmAccountMutationVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
  token: Types.Scalars['String']['input'];
}>;


export type ConfirmAccountMutation = ConfirmAccountMutation_Mutation;

export type PasswordSetMutation_setPassword_SetPassword_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type PasswordSetMutation_setPassword_SetPassword = { errors: Array<PasswordSetMutation_setPassword_SetPassword_errors_AccountError> };

export type PasswordSetMutation_Mutation = { setPassword: PasswordSetMutation_setPassword_SetPassword | null };


export type PasswordSetMutationVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
  password: Types.Scalars['String']['input'];
  token: Types.Scalars['String']['input'];
}>;


export type PasswordSetMutation = PasswordSetMutation_Mutation;

export type RequestPasswordResetMutation_requestPasswordReset_RequestPasswordReset_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type RequestPasswordResetMutation_requestPasswordReset_RequestPasswordReset = { errors: Array<RequestPasswordResetMutation_requestPasswordReset_RequestPasswordReset_errors_AccountError> };

export type RequestPasswordResetMutation_Mutation = { requestPasswordReset: RequestPasswordResetMutation_requestPasswordReset_RequestPasswordReset | null };


export type RequestPasswordResetMutationVariables = Types.Exact<{
  channel?: Types.InputMaybe<Types.Scalars['String']['input']>;
  email: Types.Scalars['String']['input'];
  redirectUrl: Types.Scalars['String']['input'];
}>;


export type RequestPasswordResetMutation = RequestPasswordResetMutation_Mutation;

export type TokenRefreshMutation_tokenRefresh_RefreshToken_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export type TokenRefreshMutation_tokenRefresh_RefreshToken = { token: string | null, errors: Array<TokenRefreshMutation_tokenRefresh_RefreshToken_errors_AccountError> };

export type TokenRefreshMutation_Mutation = { tokenRefresh: TokenRefreshMutation_tokenRefresh_RefreshToken | null };


export type TokenRefreshMutationVariables = Types.Exact<{
  refreshToken: Types.Scalars['String']['input'];
}>;


export type TokenRefreshMutation = TokenRefreshMutation_Mutation;

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

export const AccountRegisterMutationDocument = new TypedDocumentString(`
    mutation AccountRegisterMutation($accountRegisterInput: AccountRegisterInput!) {
  accountRegister(input: $accountRegisterInput) {
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
}`) as unknown as TypedDocumentString<AccountRegisterMutation, AccountRegisterMutationVariables>;
export const ConfirmAccountMutationDocument = new TypedDocumentString(`
    mutation ConfirmAccountMutation($email: String!, $token: String!) {
  confirmAccount(email: $email, token: $token) {
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
}`) as unknown as TypedDocumentString<ConfirmAccountMutation, ConfirmAccountMutationVariables>;
export const PasswordSetMutationDocument = new TypedDocumentString(`
    mutation PasswordSetMutation($email: String!, $password: String!, $token: String!) {
  setPassword(email: $email, password: $password, token: $token) {
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
}`) as unknown as TypedDocumentString<PasswordSetMutation, PasswordSetMutationVariables>;
export const RequestPasswordResetMutationDocument = new TypedDocumentString(`
    mutation RequestPasswordResetMutation($channel: String, $email: String!, $redirectUrl: String!) {
  requestPasswordReset(
    channel: $channel
    email: $email
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
}`) as unknown as TypedDocumentString<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>;
export const TokenRefreshMutationDocument = new TypedDocumentString(`
    mutation TokenRefreshMutation($refreshToken: String!) {
  tokenRefresh(refreshToken: $refreshToken) {
    token
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
}`) as unknown as TypedDocumentString<TokenRefreshMutation, TokenRefreshMutationVariables>;