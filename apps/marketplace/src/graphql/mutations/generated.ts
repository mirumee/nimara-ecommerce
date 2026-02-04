import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AccountRegister_accountRegister_AccountRegister_user_User = { id: string, email: string };

export type AccountRegister_accountRegister_AccountRegister_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode };

export type AccountRegister_accountRegister_AccountRegister = { requiresConfirmation: boolean | null, user: AccountRegister_accountRegister_AccountRegister_user_User | null, errors: Array<AccountRegister_accountRegister_AccountRegister_errors_AccountError> };

export type AccountRegister_Mutation = { accountRegister: AccountRegister_accountRegister_AccountRegister | null };


export type AccountRegisterVariables = Types.Exact<{
  input: Types.AccountRegisterInput;
}>;


export type AccountRegister = AccountRegister_Mutation;

export type ConfirmAccount_confirmAccount_ConfirmAccount_user_User = { id: string, email: string, isActive: boolean };

export type ConfirmAccount_confirmAccount_ConfirmAccount_errors_AccountError = { field: string | null, message: string | null, code: Types.AccountErrorCode };

export type ConfirmAccount_confirmAccount_ConfirmAccount = { user: ConfirmAccount_confirmAccount_ConfirmAccount_user_User | null, errors: Array<ConfirmAccount_confirmAccount_ConfirmAccount_errors_AccountError> };

export type ConfirmAccount_Mutation = { confirmAccount: ConfirmAccount_confirmAccount_ConfirmAccount | null };


export type ConfirmAccountVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
  token: Types.Scalars['String']['input'];
}>;


export type ConfirmAccount = ConfirmAccount_Mutation;

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

export const AccountRegisterDocument = new TypedDocumentString(`
    mutation AccountRegister($input: AccountRegisterInput!) {
  accountRegister(input: $input) {
    requiresConfirmation
    user {
      id
      email
    }
    errors {
      field
      message
      code
    }
  }
}
    `) as unknown as TypedDocumentString<AccountRegister, AccountRegisterVariables>;
export const ConfirmAccountDocument = new TypedDocumentString(`
    mutation ConfirmAccount($email: String!, $token: String!) {
  confirmAccount(email: $email, token: $token) {
    user {
      id
      email
      isActive
    }
    errors {
      field
      message
      code
    }
  }
}
    `) as unknown as TypedDocumentString<ConfirmAccount, ConfirmAccountVariables>;