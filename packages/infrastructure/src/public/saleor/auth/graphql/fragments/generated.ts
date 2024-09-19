import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AccountErrorFragment = { field: string | null, message: string | null, code: Types.AccountErrorCode, addressType: Types.AddressTypeEnum | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];

  constructor(private value: string, public __meta__?: Record<string, any>) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
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