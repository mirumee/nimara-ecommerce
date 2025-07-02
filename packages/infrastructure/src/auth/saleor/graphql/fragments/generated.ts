import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AccountErrorFragment = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

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
export const AccountErrorFragment = new TypedDocumentString(`
    fragment AccountErrorFragment on AccountError {
  field
  message
  code
  addressType
}
    `, {"fragmentName":"AccountErrorFragment"}) as unknown as TypedDocumentString<AccountErrorFragment, unknown>;