import { checkoutAddPromoCodeUseCase } from "#root/use-cases/checkout/checkout-add-promo-code-use-case";
import { checkoutBillingAddressUpdateUseCase } from "#root/use-cases/checkout/checkout-billing-address-update-use-case";
import { checkoutCustomerAttachUseCase } from "#root/use-cases/checkout/checkout-customer-attach-use-case";
import { deliveryMethodUpdateUseCase } from "#root/use-cases/checkout/checkout-delivery-method-update-use-case";
import { checkoutEmailUpdateUseCase } from "#root/use-cases/checkout/checkout-email-update-use-case";
import { checkoutGetUseCase } from "#root/use-cases/checkout/checkout-get-use-case";
import { checkoutRemovePromoCodeUseCase } from "#root/use-cases/checkout/checkout-remove-promo-code-use-case";
import { checkoutShippingAddressUpdateUseCase } from "#root/use-cases/checkout/checkout-shipping-address-update-use-case";
import { orderCreateUseCase } from "#root/use-cases/checkout/order-create-use-case";

import { saleorCheckoutAddPromoCodeInfra } from "./saleor/infrastructure/checkout-add-promo-code-infra";
import { saleorCheckoutCustomerAttachInfra } from "./saleor/infrastructure/checkout-customer-attach-infrastructure";
import { saleorDeliveryMethodUpdateInfra } from "./saleor/infrastructure/checkout-delivery-method-update-infra";
import { saleorCheckoutGetInfra } from "./saleor/infrastructure/checkout-get-infra";
import { saleorCheckoutRemovePromoCodeInfra } from "./saleor/infrastructure/checkout-remove-promo-code-infra";
import { saleorCheckoutShippingAddressUpdateInfra } from "./saleor/infrastructure/checkout-shipping-address-update-infra";
import { saleorCheckoutEmailUpdateInfra } from "./saleor/infrastructure/checkout-update-email-infra";
import { orderCreateInfra } from "./saleor/infrastructure/order-create-infra";
import { saleorCheckoutBillingAddressUpdateInfra } from "./saleor/infrastructure/update-checkout-billing-address-infra";
import type { CheckoutService, SaleorCheckoutServiceConfig } from "./types";

export const saleorCheckoutService: CheckoutService<
  SaleorCheckoutServiceConfig
> = (serviceConfig) => ({
  checkoutGet: checkoutGetUseCase({
    checkoutGetInfra: saleorCheckoutGetInfra(serviceConfig),
  }),
  checkoutCustomerAttach: checkoutCustomerAttachUseCase({
    checkoutCustomerAttachInfra:
      saleorCheckoutCustomerAttachInfra(serviceConfig),
  }),
  checkoutShippingAddressUpdate: checkoutShippingAddressUpdateUseCase({
    checkoutShippingAddressUpdateInfra:
      saleorCheckoutShippingAddressUpdateInfra(serviceConfig),
  }),
  checkoutEmailUpdate: checkoutEmailUpdateUseCase({
    checkoutEmailUpdateInfra: saleorCheckoutEmailUpdateInfra(serviceConfig),
  }),
  deliveryMethodUpdate: deliveryMethodUpdateUseCase({
    deliveryMethodUpdateInfra: saleorDeliveryMethodUpdateInfra(serviceConfig),
  }),
  checkoutBillingAddressUpdate: checkoutBillingAddressUpdateUseCase({
    checkoutBillingAddressUpdateInfra:
      saleorCheckoutBillingAddressUpdateInfra(serviceConfig),
  }),
  orderCreate: orderCreateUseCase({
    orderCreate: orderCreateInfra(serviceConfig),
  }),
  checkoutAddPromoCode: checkoutAddPromoCodeUseCase({
    checkoutAddPromoCodeInfra: saleorCheckoutAddPromoCodeInfra(serviceConfig),
  }),
  checkoutRemovePromoCode: checkoutRemovePromoCodeUseCase({
    checkoutRemovePromoCodeInfra:
      saleorCheckoutRemovePromoCodeInfra(serviceConfig),
  }),
});
