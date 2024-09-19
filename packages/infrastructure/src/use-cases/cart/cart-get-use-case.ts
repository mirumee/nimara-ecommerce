import type {
  CartGetInfra,
  CartGetUseCase,
} from "#root/public/saleor/cart/types";

export const cartGetUseCase = ({
  cartGetInfra,
}: {
  cartGetInfra: CartGetInfra;
}): CartGetUseCase => {
  return cartGetInfra;
};
