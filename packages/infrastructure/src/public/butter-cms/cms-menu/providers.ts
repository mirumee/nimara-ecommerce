import { cmsMenuGetUseCase } from "#root/use-cases/cms-menu/cms-menu-get-use-case";
import type { CMSMenuService } from "#root/use-cases/cms-menu/types";

import { butterCMSMenuGetInfra } from "./infrastructure/cms-menu-get-infra";
import type { ButterCMSMenuServiceConfig } from "./types";

export const butterCMSMenuService = (config: ButterCMSMenuServiceConfig) =>
  ({
    menuGet: cmsMenuGetUseCase({
      cmsMenuGetInfra: butterCMSMenuGetInfra(config),
    }),
  }) satisfies CMSMenuService;
