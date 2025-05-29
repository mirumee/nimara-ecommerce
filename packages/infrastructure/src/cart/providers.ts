import { cartGetUseCase } from "#root/use-cases/cart/cart-get-use-case";
import { linesAddUseCase } from "#root/use-cases/cart/lines-add-use-case";
import { linesDeleteUseCase } from "#root/use-cases/cart/lines-delete-use-case";
import { linesUpdateUseCase } from "#root/use-cases/cart/lines-update-use-case";

import { saleorCartCreateInfra } from "./saleor/infrastructure/cart-create-infra";
import { saleorCartGetInfra } from "./saleor/infrastructure/cart-get-infra";
import { saleorLinesAddInfra } from "./saleor/infrastructure/lines-add-infra";
import { saleorLinesDeleteInfra } from "./saleor/infrastructure/lines-delete-infra";
import { saleorLinesUpdateInfra } from "./saleor/infrastructure/lines-update-infra";
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
    logger: config.logger,
  }),
  linesDelete: linesDeleteUseCase({
    linesDeleteInfra: saleorLinesDeleteInfra(config),
  }),
  linesUpdate: linesUpdateUseCase({
    linesUpdateInfra: saleorLinesUpdateInfra(config),
  }),
});
