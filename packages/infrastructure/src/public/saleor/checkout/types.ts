import type { CheckoutError } from "@nimara/codegen/schema";
import type { Address } from "@nimara/domain/objects/Address";
import type { Checkout } from "@nimara/domain/objects/Checkout";
import type { BaseError } from "@nimara/domain/objects/Error";

import type { FetchOptions } from "#root/graphql/client";

import type { CheckoutShippingAddressUpdate_checkoutShippingAddressUpdate_CheckoutShippingAddressUpdate } from "./graphql/mutations/generated";

export type WithFetchOptions = { options?: FetchOptions };

export type CheckoutEmailOptions = {
  checkout: Checkout;
  email: string;
} & WithFetchOptions;

export type CheckoutEmailUpdateInfra = (opts: CheckoutEmailOptions) => Promise<
  | { isSuccess: boolean; serverError?: never; validationErrors?: never }
  | {
      isSuccess: boolean;
      serverError?: BaseError;
      validationErrors?: { code: string; field: string | null }[];
    }
>;
export type CheckoutEmailUpdateUseCase = CheckoutEmailUpdateInfra;

export type CheckoutDeliveryMethodOptions = {
  checkout: Checkout;
  deliveryMethodId: string;
} & WithFetchOptions;

export type CheckoutDeliveryMethodUpdateInfra = (
  opts: CheckoutDeliveryMethodOptions,
) => Promise<
  | { isSuccess: boolean; serverError?: never; validationErrors?: never }
  | {
      isSuccess: boolean;
      serverError?: BaseError;
      validationErrors?: { code: string; field: string | null }[];
    }
>;

export type CheckoutDeliveryMethodUpdateUseCase =
  CheckoutDeliveryMethodUpdateInfra;

export type CheckoutPromoCodeOptions = {
  checkoutId: string;
  promoCode: string;
} & WithFetchOptions;

export type CheckoutAddPromoCodeInfra = (
  opts: CheckoutPromoCodeOptions,
) => Promise<
  | { isSuccess: true }
  | {
      isSuccess: false;
      serverError: BaseError;
    }
  | {
      isSuccess: false;
      validationErrors: { code: string; field: string | null }[];
    }
>;

export type CheckoutAddPromoCodeUseCase = CheckoutAddPromoCodeInfra;

export type CheckoutRemovePromoCodeInfra = (
  opts: CheckoutPromoCodeOptions,
) => Promise<
  | { isSuccess: true }
  | {
      isSuccess: false;
      serverError: BaseError;
    }
  | {
      isSuccess: false;
      validationErrors: { code: string; field: string | null }[];
    }
>;

export type CheckoutRemovePromoCodeUseCase = CheckoutRemovePromoCodeInfra;

export type CheckoutGetInfra = (opts: {
  checkoutId: string;
  countryCode: string;
  languageCode: string;
}) => Promise<{
  checkout: Checkout | null;
  errors?: BaseError[];
  isSuccess: boolean;
}>;
export type CheckoutGetUseCase = CheckoutGetInfra;

export type OrderCreateInfra = (opts: { id: string }) => Promise<{
  errors: { code: string; type: string }[];
  orderId: string | null;
}>;
export type OrderCreateUseCase = OrderCreateInfra;

export type CheckoutBillingAddressUpdateInfra = (opts: {
  address: Partial<Omit<Address, "id">>;
  checkoutId: string;
}) => Promise<{
  isSuccess: boolean;
  serverError?: BaseError;
  validationErrors?: any[];
}>;

export type CheckoutCustomerAttachInfra = (opts: {
  accessToken: string | undefined;
  id: string;
}) => Promise<{ errors: CheckoutError[] } | null>;

export type CheckoutCustomerAttachUseCase = CheckoutCustomerAttachInfra;

export type CheckoutBillingAddressUpdateUseCase =
  CheckoutBillingAddressUpdateInfra;

export type CheckoutShippingAddressUpdateInfra =
  CheckoutBillingAddressUpdateInfra;

export type CheckoutShippingAddressUpdateUseCase =
  CheckoutShippingAddressUpdateInfra;

export type ValidationError =
  CheckoutShippingAddressUpdate_checkoutShippingAddressUpdate_CheckoutShippingAddressUpdate;

export type SaleorCheckoutServiceConfig = {
  apiURL: string;
};

export type CheckoutService<Config> = (config: Config) => {
  checkoutAddPromoCode: CheckoutAddPromoCodeUseCase;
  checkoutBillingAddressUpdate: CheckoutBillingAddressUpdateUseCase;
  checkoutCustomerAttach: CheckoutCustomerAttachUseCase;
  checkoutEmailUpdate: CheckoutEmailUpdateUseCase;
  checkoutGet: CheckoutGetUseCase;
  checkoutRemovePromoCode: CheckoutRemovePromoCodeUseCase;
  checkoutShippingAddressUpdate: CheckoutShippingAddressUpdateUseCase;
  deliveryMethodUpdate: CheckoutDeliveryMethodUpdateUseCase;
  orderCreate: OrderCreateUseCase;
};
