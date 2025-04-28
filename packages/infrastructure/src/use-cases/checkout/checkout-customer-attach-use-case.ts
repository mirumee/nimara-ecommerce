import type {
  CheckoutCustomerAttachInfra,
  CheckoutCustomerAttachUseCase,
} from "#root/checkout/types";

export const checkoutCustomerAttachUseCase = ({
  checkoutCustomerAttachInfra,
}: {
  checkoutCustomerAttachInfra: CheckoutCustomerAttachInfra;
}): CheckoutCustomerAttachUseCase => {
  return checkoutCustomerAttachInfra;
};
