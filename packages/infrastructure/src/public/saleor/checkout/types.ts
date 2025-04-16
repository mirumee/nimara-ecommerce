import type { Address } from "@nimara/domain/objects/Address";
import type { Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult } from "@nimara/domain/objects/Result";

import type { FetchOptions } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";

export type WithFetchOptions = { options?: FetchOptions };

export type CheckoutEmailOptions = {
  checkout: Checkout;
  email: string;
} & WithFetchOptions;

export type CheckoutEmailUpdateInfra = (
  opts: CheckoutEmailOptions,
) => AsyncResult<{ success: true }>;

export type CheckoutEmailUpdateUseCase = CheckoutEmailUpdateInfra;

export type CheckoutDeliveryMethodOptions = {
  checkout: Checkout;
  deliveryMethodId: string;
} & WithFetchOptions;

export type CheckoutDeliveryMethodUpdateInfra = (
  opts: CheckoutDeliveryMethodOptions,
) => AsyncResult<{ success: true }>;

export type CheckoutDeliveryMethodUpdateUseCase =
  CheckoutDeliveryMethodUpdateInfra;

export type CheckoutPromoCodeOptions = {
  checkoutId: string;
  promoCode: string;
} & WithFetchOptions;

export type CheckoutAddPromoCodeInfra = (
  opts: CheckoutPromoCodeOptions,
) => AsyncResult<{ success: true }>;

export type CheckoutAddPromoCodeUseCase = CheckoutAddPromoCodeInfra;

export type CheckoutRemovePromoCodeInfra = (
  opts: CheckoutPromoCodeOptions,
) => AsyncResult<{ success: true }>;

export type CheckoutRemovePromoCodeUseCase = CheckoutRemovePromoCodeInfra;

export type CheckoutGetInfra = (opts: {
  checkoutId: string;
  countryCode: string;
  languageCode: string;
}) => AsyncResult<{
  checkout: Checkout;
}>;
export type CheckoutGetUseCase = CheckoutGetInfra;

export type OrderCreateInfra = (opts: { id: string }) => AsyncResult<{
  orderId: string;
}>;
export type OrderCreateUseCase = OrderCreateInfra;

export type CheckoutBillingAddressUpdateInfra = (opts: {
  address: Partial<Omit<Address, "id">>;
  checkoutId: string;
}) => AsyncResult<{ success: true }>;

export type CheckoutCustomerAttachInfra = (opts: {
  accessToken: string | undefined;
  id: string;
}) => AsyncResult<{ success: true }>;

export type CheckoutCustomerAttachUseCase = CheckoutCustomerAttachInfra;

export type CheckoutBillingAddressUpdateUseCase =
  CheckoutBillingAddressUpdateInfra;

export type CheckoutShippingAddressUpdateInfra =
  CheckoutBillingAddressUpdateInfra;

export type CheckoutShippingAddressUpdateUseCase =
  CheckoutShippingAddressUpdateInfra;

export type SaleorCheckoutServiceConfig = {
  apiURL: string;
  logger: Logger;
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
