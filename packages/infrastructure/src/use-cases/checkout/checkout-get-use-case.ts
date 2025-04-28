import type {
  CheckoutGetInfra,
  CheckoutGetUseCase,
} from "#root/checkout/types";

export const checkoutGetUseCase = ({
  checkoutGetInfra,
}: {
  checkoutGetInfra: CheckoutGetInfra;
}): CheckoutGetUseCase => {
  return checkoutGetInfra;
};
