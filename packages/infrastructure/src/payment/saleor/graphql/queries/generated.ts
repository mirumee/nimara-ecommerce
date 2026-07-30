import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type StoredPaymentMethodListQuery_me_User_storedPaymentMethods_StoredPaymentMethod_creditCardInfo_CreditCard = { brand: string, firstDigits: string | null, lastDigits: string, expMonth: number | null, expYear: number | null };

export type StoredPaymentMethodListQuery_me_User_storedPaymentMethods_StoredPaymentMethod = { id: string, paymentMethodId: string, name: string | null, type: string, data: unknown | null, creditCardInfo: StoredPaymentMethodListQuery_me_User_storedPaymentMethods_StoredPaymentMethod_creditCardInfo_CreditCard | null };

export type StoredPaymentMethodListQuery_me_User = { storedPaymentMethods: Array<StoredPaymentMethodListQuery_me_User_storedPaymentMethods_StoredPaymentMethod> | null };

export type StoredPaymentMethodListQuery_Query = { me: StoredPaymentMethodListQuery_me_User | null };


export type StoredPaymentMethodListQueryVariables = Types.Exact<{
  channel: Types.Scalars['String']['input'];
}>;


export type StoredPaymentMethodListQuery = StoredPaymentMethodListQuery_Query;

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

export const StoredPaymentMethodListQueryDocument = new TypedDocumentString(`
    query StoredPaymentMethodListQuery($channel: String!) {
  me {
    storedPaymentMethods(channel: $channel) {
      id
      paymentMethodId
      name
      type
      data
      creditCardInfo {
        brand
        firstDigits
        lastDigits
        expMonth
        expYear
      }
    }
  }
}
    `) as unknown as TypedDocumentString<StoredPaymentMethodListQuery, StoredPaymentMethodListQueryVariables>;