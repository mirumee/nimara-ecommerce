import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AccountRegisterVariables = Types.Exact<{
  input: Types.AccountRegisterInput;
}>;


export type AccountRegister = { __typename?: 'Mutation', accountRegister?: { __typename?: 'AccountRegister', requiresConfirmation?: boolean | null, user?: { __typename?: 'User', id: string, email?: string | null } | null, errors: Array<{ __typename?: 'AccountError', field?: string | null, message?: string | null, code: Types.AccountErrorCode }> } | null };

export type ConfirmAccountVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
  token: Types.Scalars['String']['input'];
}>;


export type ConfirmAccount = { __typename?: 'Mutation', confirmAccount?: { __typename?: 'ConfirmAccount', user?: { __typename?: 'User', id: string, email?: string | null, isActive?: boolean | null } | null, errors: Array<{ __typename?: 'AccountError', field?: string | null, message?: string | null, code: Types.AccountErrorCode }> } | null };

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