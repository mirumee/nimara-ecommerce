import { cmsPageGetUseCase } from "#root/use-cases/cms-page/cms-page-get-use-case";
import type { CMSPageService } from "#root/use-cases/cms-page/types";

import { butterCMSPageGetInfra } from "./infrastructure/cms-page-get-infra";
import type { ButterCMSPageServiceConfig } from "./types";

export const butterCMSPageService = (config: ButterCMSPageServiceConfig) =>
  ({
    cmsPageGet: cmsPageGetUseCase({
      cmsPageGetInfra: butterCMSPageGetInfra(config),
    }),
  }) satisfies CMSPageService;
