import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CheckoutAddPromoCodeMutation_checkoutAddPromoCode_CheckoutAddPromoCode_checkout_Checkout = { id: string };

export type CheckoutAddPromoCodeMutation_checkoutAddPromoCode_CheckoutAddPromoCode_errors_CheckoutError = { addressType: Types.AddressTypeEnum | null, code: Types.CheckoutErrorCode, field: string | null, lines: Array<string> | null, message: string | null, variants: Array<string> | null };

export type CheckoutAddPromoCodeMutation_checkoutAddPromoCode_CheckoutAddPromoCode = { checkout: CheckoutAddPromoCodeMutation_checkoutAddPromoCode_CheckoutAddPromoCode_checkout_Checkout | null, errors: Array<CheckoutAddPromoCodeMutation_checkoutAddPromoCode_CheckoutAddPromoCode_errors_CheckoutError> };

export type CheckoutAddPromoCodeMutation_Mutation = { checkoutAddPromoCode: CheckoutAddPromoCodeMutation_checkoutAddPromoCode_CheckoutAddPromoCode | null };


export type CheckoutAddPromoCodeMutationVariables = Types.Exact<{
  promoCode: Types.Scalars['String']['input'];
  checkoutId: Types.Scalars['ID']['input'];
}>;


export type CheckoutAddPromoCodeMutation = CheckoutAddPromoCodeMutation_Mutation;

export type CheckoutBillingAddressUpdateMutation_checkoutBillingAddressUpdate_CheckoutBillingAddressUpdate_errors_CheckoutError = { addressType: Types.AddressTypeEnum | null, code: Types.CheckoutErrorCode, field: string | null, lines: Array<string> | null, message: string | null, variants: Array<string> | null };

export type CheckoutBillingAddressUpdateMutation_checkoutBillingAddressUpdate_CheckoutBillingAddressUpdate = { errors: Array<CheckoutBillingAddressUpdateMutation_checkoutBillingAddressUpdate_CheckoutBillingAddressUpdate_errors_CheckoutError> };

export type CheckoutBillingAddressUpdateMutation_Mutation = { checkoutBillingAddressUpdate: CheckoutBillingAddressUpdateMutation_checkoutBillingAddressUpdate_CheckoutBillingAddressUpdate | null };


export type CheckoutBillingAddressUpdateMutationVariables = Types.Exact<{
  checkoutId: Types.Scalars['ID']['input'];
  address: Types.AddressInput;
}>;


export type CheckoutBillingAddressUpdateMutation = CheckoutBillingAddressUpdateMutation_Mutation;

export type CheckoutCompleteMutation_checkoutComplete_CheckoutComplete_order_Order = { id: string };

export type CheckoutCompleteMutation_checkoutComplete_CheckoutComplete_errors_CheckoutError = { field: string | null, message: string | null, code: Types.CheckoutErrorCode };

export type CheckoutCompleteMutation_checkoutComplete_CheckoutComplete = { order: CheckoutCompleteMutation_checkoutComplete_CheckoutComplete_order_Order | null, errors: Array<CheckoutCompleteMutation_checkoutComplete_CheckoutComplete_errors_CheckoutError> };

export type CheckoutCompleteMutation_Mutation = { checkoutComplete: CheckoutCompleteMutation_checkoutComplete_CheckoutComplete | null };


export type CheckoutCompleteMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type CheckoutCompleteMutation = CheckoutCompleteMutation_Mutation;

export type CheckoutCustomerAttachMutation_checkoutCustomerAttach_CheckoutCustomerAttach_errors_CheckoutError = { addressType: Types.AddressTypeEnum | null, code: Types.CheckoutErrorCode, field: string | null, lines: Array<string> | null, message: string | null, variants: Array<string> | null };

export type CheckoutCustomerAttachMutation_checkoutCustomerAttach_CheckoutCustomerAttach = { errors: Array<CheckoutCustomerAttachMutation_checkoutCustomerAttach_CheckoutCustomerAttach_errors_CheckoutError> };

export type CheckoutCustomerAttachMutation_Mutation = { checkoutCustomerAttach: CheckoutCustomerAttachMutation_checkoutCustomerAttach_CheckoutCustomerAttach | null };


export type CheckoutCustomerAttachMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type CheckoutCustomerAttachMutation = CheckoutCustomerAttachMutation_Mutation;

export type CheckoutDeliveryMethodUpdateMutation_checkoutDeliveryMethodUpdate_CheckoutDeliveryMethodUpdate_errors_CheckoutError = { addressType: Types.AddressTypeEnum | null, code: Types.CheckoutErrorCode, field: string | null, lines: Array<string> | null, message: string | null, variants: Array<string> | null };

export type CheckoutDeliveryMethodUpdateMutation_checkoutDeliveryMethodUpdate_CheckoutDeliveryMethodUpdate_checkout_Checkout = { id: string };

export type CheckoutDeliveryMethodUpdateMutation_checkoutDeliveryMethodUpdate_CheckoutDeliveryMethodUpdate = { errors: Array<CheckoutDeliveryMethodUpdateMutation_checkoutDeliveryMethodUpdate_CheckoutDeliveryMethodUpdate_errors_CheckoutError>, checkout: CheckoutDeliveryMethodUpdateMutation_checkoutDeliveryMethodUpdate_CheckoutDeliveryMethodUpdate_checkout_Checkout | null };

export type CheckoutDeliveryMethodUpdateMutation_Mutation = { checkoutDeliveryMethodUpdate: CheckoutDeliveryMethodUpdateMutation_checkoutDeliveryMethodUpdate_CheckoutDeliveryMethodUpdate | null };


export type CheckoutDeliveryMethodUpdateMutationVariables = Types.Exact<{
  checkoutId: Types.Scalars['ID']['input'];
  deliveryMethodId: Types.Scalars['ID']['input'];
}>;


export type CheckoutDeliveryMethodUpdateMutation = CheckoutDeliveryMethodUpdateMutation_Mutation;

export type CheckoutEmailUpdateMutation_checkoutEmailUpdate_CheckoutEmailUpdate_checkout_Checkout = { id: string };

export type CheckoutEmailUpdateMutation_checkoutEmailUpdate_CheckoutEmailUpdate_errors_CheckoutError = { field: string | null, code: Types.CheckoutErrorCode };

export type CheckoutEmailUpdateMutation_checkoutEmailUpdate_CheckoutEmailUpdate = { checkout: CheckoutEmailUpdateMutation_checkoutEmailUpdate_CheckoutEmailUpdate_checkout_Checkout | null, errors: Array<CheckoutEmailUpdateMutation_checkoutEmailUpdate_CheckoutEmailUpdate_errors_CheckoutError> };

export type CheckoutEmailUpdateMutation_Mutation = { checkoutEmailUpdate: CheckoutEmailUpdateMutation_checkoutEmailUpdate_CheckoutEmailUpdate | null };


export type CheckoutEmailUpdateMutationVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
  checkoutId: Types.Scalars['ID']['input'];
}>;


export type CheckoutEmailUpdateMutation = CheckoutEmailUpdateMutation_Mutation;

export type CheckoutRemovePromoCodeMutation_checkoutRemovePromoCode_CheckoutRemovePromoCode_checkout_Checkout = { id: string };

export type CheckoutRemovePromoCodeMutation_checkoutRemovePromoCode_CheckoutRemovePromoCode_errors_CheckoutError = { addressType: Types.AddressTypeEnum | null, code: Types.CheckoutErrorCode, field: string | null, lines: Array<string> | null, message: string | null, variants: Array<string> | null };

export type CheckoutRemovePromoCodeMutation_checkoutRemovePromoCode_CheckoutRemovePromoCode = { checkout: CheckoutRemovePromoCodeMutation_checkoutRemovePromoCode_CheckoutRemovePromoCode_checkout_Checkout | null, errors: Array<CheckoutRemovePromoCodeMutation_checkoutRemovePromoCode_CheckoutRemovePromoCode_errors_CheckoutError> };

export type CheckoutRemovePromoCodeMutation_Mutation = { checkoutRemovePromoCode: CheckoutRemovePromoCodeMutation_checkoutRemovePromoCode_CheckoutRemovePromoCode | null };


export type CheckoutRemovePromoCodeMutationVariables = Types.Exact<{
  promoCode: Types.Scalars['String']['input'];
  checkoutId: Types.Scalars['ID']['input'];
}>;


export type CheckoutRemovePromoCodeMutation = CheckoutRemovePromoCodeMutation_Mutation;

export type CheckoutShippingAddressUpdate_checkoutShippingAddressUpdate_CheckoutShippingAddressUpdate_errors_CheckoutError = { addressType: Types.AddressTypeEnum | null, code: Types.CheckoutErrorCode, field: string | null, lines: Array<string> | null, message: string | null, variants: Array<string> | null };

export type CheckoutShippingAddressUpdate_checkoutShippingAddressUpdate_CheckoutShippingAddressUpdate = { errors: Array<CheckoutShippingAddressUpdate_checkoutShippingAddressUpdate_CheckoutShippingAddressUpdate_errors_CheckoutError> };

export type CheckoutShippingAddressUpdate_Mutation = { checkoutShippingAddressUpdate: CheckoutShippingAddressUpdate_checkoutShippingAddressUpdate_CheckoutShippingAddressUpdate | null };


export type CheckoutShippingAddressUpdateVariables = Types.Exact<{
  checkoutId: Types.Scalars['ID']['input'];
  shippingAddress: Types.AddressInput;
}>;


export type CheckoutShippingAddressUpdate = CheckoutShippingAddressUpdate_Mutation;

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

export const CheckoutAddPromoCodeMutationDocument = new TypedDocumentString(`
    mutation CheckoutAddPromoCodeMutation($promoCode: String!, $checkoutId: ID!) {
  checkoutAddPromoCode(promoCode: $promoCode, id: $checkoutId) {
    checkout {
      id
    }
    errors {
      ...CheckoutErrorFragment
    }
  }
}
    fragment CheckoutErrorFragment on CheckoutError {
  addressType
  code
  field
  lines
  message
  variants
}`) as unknown as TypedDocumentString<CheckoutAddPromoCodeMutation, CheckoutAddPromoCodeMutationVariables>;
export const CheckoutBillingAddressUpdateMutationDocument = new TypedDocumentString(`
    mutation checkoutBillingAddressUpdateMutation($checkoutId: ID!, $address: AddressInput!) {
  checkoutBillingAddressUpdate(id: $checkoutId, billingAddress: $address) {
    errors {
      ...CheckoutErrorFragment
    }
  }
}
    fragment CheckoutErrorFragment on CheckoutError {
  addressType
  code
  field
  lines
  message
  variants
}`) as unknown as TypedDocumentString<CheckoutBillingAddressUpdateMutation, CheckoutBillingAddressUpdateMutationVariables>;
export const CheckoutCompleteMutationDocument = new TypedDocumentString(`
    mutation CheckoutCompleteMutation($id: ID!) {
  checkoutComplete(id: $id) {
    order {
      id
    }
    errors {
      field
      message
      code
    }
  }
}
    `) as unknown as TypedDocumentString<CheckoutCompleteMutation, CheckoutCompleteMutationVariables>;
export const CheckoutCustomerAttachMutationDocument = new TypedDocumentString(`
    mutation CheckoutCustomerAttachMutation($id: ID!) {
  checkoutCustomerAttach(id: $id) {
    errors {
      ...CheckoutErrorFragment
    }
  }
}
    fragment CheckoutErrorFragment on CheckoutError {
  addressType
  code
  field
  lines
  message
  variants
}`) as unknown as TypedDocumentString<CheckoutCustomerAttachMutation, CheckoutCustomerAttachMutationVariables>;
export const CheckoutDeliveryMethodUpdateMutationDocument = new TypedDocumentString(`
    mutation CheckoutDeliveryMethodUpdateMutation($checkoutId: ID!, $deliveryMethodId: ID!) {
  checkoutDeliveryMethodUpdate(
    id: $checkoutId
    deliveryMethodId: $deliveryMethodId
  ) {
    errors {
      ...CheckoutErrorFragment
    }
    checkout {
      id
    }
  }
}
    fragment CheckoutErrorFragment on CheckoutError {
  addressType
  code
  field
  lines
  message
  variants
}`) as unknown as TypedDocumentString<CheckoutDeliveryMethodUpdateMutation, CheckoutDeliveryMethodUpdateMutationVariables>;
export const CheckoutEmailUpdateMutationDocument = new TypedDocumentString(`
    mutation CheckoutEmailUpdateMutation($email: String!, $checkoutId: ID!) {
  checkoutEmailUpdate(email: $email, id: $checkoutId) {
    checkout {
      id
    }
    errors {
      field
      code
    }
  }
}
    `) as unknown as TypedDocumentString<CheckoutEmailUpdateMutation, CheckoutEmailUpdateMutationVariables>;
export const CheckoutRemovePromoCodeMutationDocument = new TypedDocumentString(`
    mutation CheckoutRemovePromoCodeMutation($promoCode: String!, $checkoutId: ID!) {
  checkoutRemovePromoCode(promoCode: $promoCode, id: $checkoutId) {
    checkout {
      id
    }
    errors {
      ...CheckoutErrorFragment
    }
  }
}
    fragment CheckoutErrorFragment on CheckoutError {
  addressType
  code
  field
  lines
  message
  variants
}`) as unknown as TypedDocumentString<CheckoutRemovePromoCodeMutation, CheckoutRemovePromoCodeMutationVariables>;
export const CheckoutShippingAddressUpdateDocument = new TypedDocumentString(`
    mutation checkoutShippingAddressUpdate($checkoutId: ID!, $shippingAddress: AddressInput!) {
  checkoutShippingAddressUpdate(
    id: $checkoutId
    shippingAddress: $shippingAddress
  ) {
    errors {
      ...CheckoutErrorFragment
    }
  }
}
    fragment CheckoutErrorFragment on CheckoutError {
  addressType
  code
  field
  lines
  message
  variants
}`) as unknown as TypedDocumentString<CheckoutShippingAddressUpdate, CheckoutShippingAddressUpdateVariables>;