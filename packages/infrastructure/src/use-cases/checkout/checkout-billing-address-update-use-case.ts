import type {
  CheckoutBillingAddressUpdateInfra,
  CheckoutBillingAddressUpdateUseCase,
} from "#root/checkout/types";

export const checkoutBillingAddressUpdateUseCase = ({
  checkoutBillingAddressUpdateInfra,
}: {
  checkoutBillingAddressUpdateInfra: CheckoutBillingAddressUpdateInfra;
}): CheckoutBillingAddressUpdateUseCase => checkoutBillingAddressUpdateInfra;
