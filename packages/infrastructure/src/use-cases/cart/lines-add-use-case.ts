import type {
  CartCreateInfra,
  LinesAddInfra,
  LinesAddUseCase,
} from "#root/public/saleor/cart/types";

export const linesAddUseCase = ({
  linesAddInfra,
  cartCreateInfra,
}: {
  cartCreateInfra: CartCreateInfra;
  linesAddInfra: LinesAddInfra;
}): LinesAddUseCase => {
  return async ({ email, lines, options, cartId }) => {
    if (cartId) {
      const errors = await linesAddInfra({
        cartId,
        options,
        lines,
      });

      return { errors, cartId: null };
    }

    return cartCreateInfra({ email, options, lines });
  };
};
