import { cartGetUseCase } from "#root/use-cases/cart/cart-get-use-case";
import { linesAddUseCase } from "#root/use-cases/cart/lines-add-use-case";
import { linesDeleteUseCase } from "#root/use-cases/cart/lines-delete-use-case";
import { linesUpdateUseCase } from "#root/use-cases/cart/lines-update-use-case";

import { saleorCartCreateInfra } from "./infrastructure/cart-create-infra";
import { saleorCartGetInfra } from "./infrastructure/cart-get-infra";
import { saleorLinesAddInfra } from "./infrastructure/lines-add-infra";
import { saleorLinesDeleteInfra } from "./infrastructure/lines-delete-infra";
import { saleorLinesUpdateInfra } from "./infrastructure/lines-update-infra";
import type { CartService, SaleorCartServiceConfig } from "./types";

export const saleorCartService: CartService<SaleorCartServiceConfig> = (
  config,
) => ({
  cartGet: cartGetUseCase({
    cartGetInfra: saleorCartGetInfra(config),
  }),
  linesAdd: linesAddUseCase({
    linesAddInfra: saleorLinesAddInfra(config),
    cartCreateInfra: saleorCartCreateInfra(config),
  }),
  linesDelete: linesDeleteUseCase({
    linesDeleteInfra: saleorLinesDeleteInfra(config),
  }),
  linesUpdate: linesUpdateUseCase({
    linesUpdateInfra: saleorLinesUpdateInfra(config),
  }),
});
