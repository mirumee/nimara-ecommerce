import { cmsMenuGetUseCase } from "#root/use-cases/cms-menu/cms-menu-get-use-case";
import type { CMSMenuService } from "#root/use-cases/cms-menu/types";

import { saleorCMSMenuGetInfra } from "./infrastructure/cms-menu-get-infra";
import type { SaleorCMSMenuServiceConfig } from "./types";

export const saleorCMSMenuService = (config: SaleorCMSMenuServiceConfig) =>
  ({
    menuGet: cmsMenuGetUseCase({
      cmsMenuGetInfra: saleorCMSMenuGetInfra(config),
    }),
  }) satisfies CMSMenuService;
