import type {
  CheckoutShippingAddressUpdateInfra,
  CheckoutShippingAddressUpdateUseCase,
} from "#root/public/saleor/checkout/types";

export const checkoutShippingAddressUpdateUseCase = ({
  checkoutShippingAddressUpdateInfra,
}: {
  checkoutShippingAddressUpdateInfra: CheckoutShippingAddressUpdateInfra;
}): CheckoutShippingAddressUpdateUseCase => {
  return checkoutShippingAddressUpdateInfra;
};
