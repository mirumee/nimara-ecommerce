import type {
  CheckoutRemovePromoCodeInfra,
  CheckoutRemovePromoCodeUseCase,
} from "#root/checkout/types";

export const checkoutRemovePromoCodeUseCase = ({
  checkoutRemovePromoCodeInfra,
}: {
  checkoutRemovePromoCodeInfra: CheckoutRemovePromoCodeInfra;
}): CheckoutRemovePromoCodeUseCase => checkoutRemovePromoCodeInfra;
