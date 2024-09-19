import { cmsMenuGetUseCase } from "#root/use-cases/cms-menu/cms-menu-get-use-case";

import { saleorCMSMenuGetInfra } from "./infrastructure/cms-menu-get-infra";
import type { CMSMenuService, SaleorCMSMenuServiceConfig } from "./types";

export const saleorCMSMenuService: CMSMenuService<
  SaleorCMSMenuServiceConfig
> = (config) => ({
  menuGet: cmsMenuGetUseCase({
    cmsMenuGetInfra: saleorCMSMenuGetInfra(config),
  }),
});
