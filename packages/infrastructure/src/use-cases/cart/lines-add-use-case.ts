import { ok } from "@nimara/domain/objects/Result";

import type {
  CartCreateInfra,
  LinesAddInfra,
  LinesAddUseCase,
} from "#root/cart/types";
import { type Logger } from "#root/logging/types";

export const linesAddUseCase = ({
  linesAddInfra,
  cartCreateInfra,
  logger,
}: {
  cartCreateInfra: CartCreateInfra;
  linesAddInfra: LinesAddInfra;
  logger: Logger;
}): LinesAddUseCase => {
  return async ({ cartId, email, lines, ...restOpts }) => {
    if (cartId) {
      logger.debug("Adding lines to existing cart", { cartId });

      const resultLinesAdd = await linesAddInfra({
        cartId,
        lines,
        ...restOpts,
      });

      if (!resultLinesAdd.ok) {
        return resultLinesAdd;
      }

      return ok({ cartId });
    }

    logger.debug("Creating cart and adding lines", { email, lines });

    return cartCreateInfra({ ...restOpts, lines, email });
  };
};
