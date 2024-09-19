import type {
  CheckoutBillingAddressUpdateInfra,
  CheckoutBillingAddressUpdateUseCase,
} from "#root/public/saleor/checkout/types";

export const checkoutBillingAddressUpdateUseCase = ({
  checkoutBillingAddressUpdateInfra,
}: {
  checkoutBillingAddressUpdateInfra: CheckoutBillingAddressUpdateInfra;
}): CheckoutBillingAddressUpdateUseCase => checkoutBillingAddressUpdateInfra;
