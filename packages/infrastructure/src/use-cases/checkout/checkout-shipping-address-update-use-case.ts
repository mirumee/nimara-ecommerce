import type {
  CheckoutShippingAddressUpdateInfra,
  CheckoutShippingAddressUpdateUseCase,
} from "#root/checkout/types";

export const checkoutShippingAddressUpdateUseCase = ({
  checkoutShippingAddressUpdateInfra,
}: {
  checkoutShippingAddressUpdateInfra: CheckoutShippingAddressUpdateInfra;
}): CheckoutShippingAddressUpdateUseCase => {
  return checkoutShippingAddressUpdateInfra;
};
