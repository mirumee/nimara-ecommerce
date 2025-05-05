import { cmsMenuGetUseCase } from "#root/use-cases/cms-menu/cms-menu-get-use-case";
import type { CMSMenuService } from "#root/use-cases/cms-menu/types";

import { butterCMSMenuGetInfra } from "./butter-cms/infrastructure/cms-menu-get-infra";
import { saleorCMSMenuGetInfra } from "./saleor/infrastructure/cms-menu-get-infra";
import type {
  ButterCMSMenuServiceConfig,
  SaleorCMSMenuServiceConfig,
} from "./types";

export const saleorCMSMenuService = (config: SaleorCMSMenuServiceConfig) =>
  ({
    menuGet: cmsMenuGetUseCase({
      cmsMenuGetInfra: saleorCMSMenuGetInfra(config),
    }),
  }) satisfies CMSMenuService;

export const butterCMSMenuService = (config: ButterCMSMenuServiceConfig) =>
  ({
    menuGet: cmsMenuGetUseCase({
      cmsMenuGetInfra: butterCMSMenuGetInfra(config),
    }),
  }) satisfies CMSMenuService;
