import type {
  CheckoutCustomerAttachInfra,
  CheckoutCustomerAttachUseCase,
} from "#root/public/saleor/checkout/types";

export const checkoutCustomerAttachUseCase = ({
  checkoutCustomerAttachInfra,
}: {
  checkoutCustomerAttachInfra: CheckoutCustomerAttachInfra;
}): CheckoutCustomerAttachUseCase => {
  return checkoutCustomerAttachInfra;
};
