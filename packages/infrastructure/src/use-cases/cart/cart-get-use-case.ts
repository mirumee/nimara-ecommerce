import type { CartGetInfra, CartGetUseCase } from "#root/cart/types";

export const cartGetUseCase = ({
  cartGetInfra,
}: {
  cartGetInfra: CartGetInfra;
}): CartGetUseCase => {
  return cartGetInfra;
};
