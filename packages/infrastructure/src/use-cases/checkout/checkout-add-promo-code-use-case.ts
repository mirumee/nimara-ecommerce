import type {
  CheckoutAddPromoCodeInfra,
  CheckoutAddPromoCodeUseCase,
} from "#root/checkout/types";

export const checkoutAddPromoCodeUseCase = ({
  checkoutAddPromoCodeInfra,
}: {
  checkoutAddPromoCodeInfra: CheckoutAddPromoCodeInfra;
}): CheckoutAddPromoCodeUseCase => checkoutAddPromoCodeInfra;
