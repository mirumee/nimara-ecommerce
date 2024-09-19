import type {
  CheckoutGetInfra,
  CheckoutGetUseCase,
} from "#root/public/saleor/checkout/types";

export const checkoutGetUseCase = ({
  checkoutGetInfra,
}: {
  checkoutGetInfra: CheckoutGetInfra;
}): CheckoutGetUseCase => {
  return checkoutGetInfra;
};
