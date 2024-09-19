import type {
  CheckoutRemovePromoCodeInfra,
  CheckoutRemovePromoCodeUseCase,
} from "#root/public/saleor/checkout/types";

export const checkoutRemovePromoCodeUseCase = ({
  checkoutRemovePromoCodeInfra,
}: {
  checkoutRemovePromoCodeInfra: CheckoutRemovePromoCodeInfra;
}): CheckoutRemovePromoCodeUseCase => checkoutRemovePromoCodeInfra;
