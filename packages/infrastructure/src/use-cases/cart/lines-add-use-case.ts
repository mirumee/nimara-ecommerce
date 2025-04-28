import { ok } from "@nimara/domain/objects/Result";

import type {
  CartCreateInfra,
  LinesAddInfra,
  LinesAddUseCase,
} from "#root/cart/types";

export const linesAddUseCase = ({
  linesAddInfra,
  cartCreateInfra,
}: {
  cartCreateInfra: CartCreateInfra;
  linesAddInfra: LinesAddInfra;
}): LinesAddUseCase => {
  return async ({ email, lines, options, cartId }) => {
    if (cartId) {
      const resultLinesAdd = await linesAddInfra({
        cartId,
        options,
        lines,
      });

      if (!resultLinesAdd.ok) {
        return resultLinesAdd;
      }

      return ok({ cartId });
    }

    return cartCreateInfra({ email, options, lines });
  };
};
