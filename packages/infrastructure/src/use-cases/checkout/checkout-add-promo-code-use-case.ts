import type {
  CheckoutAddPromoCodeInfra,
  CheckoutAddPromoCodeUseCase,
} from "#root/public/saleor/checkout/types";

export const checkoutAddPromoCodeUseCase = ({
  checkoutAddPromoCodeInfra,
}: {
  checkoutAddPromoCodeInfra: CheckoutAddPromoCodeInfra;
}): CheckoutAddPromoCodeUseCase => checkoutAddPromoCodeInfra;
