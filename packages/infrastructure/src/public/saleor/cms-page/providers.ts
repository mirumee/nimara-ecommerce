import { cmsPageGetUseCase } from "#root/use-cases/cms-page/cms-page-get-use-case";
import { type CMSPageService } from "#root/use-cases/cms-page/types";

import { saleorCMSPageGetInfra } from "./infrastructure/cms-page-get-infra";
import type { SaleorCMSPageServiceConfig } from "./types";

export const saleorCMSPageService = (config: SaleorCMSPageServiceConfig) =>
  ({
    cmsPageGet: cmsPageGetUseCase({
      cmsPageGetInfra: saleorCMSPageGetInfra(config),
    }),
  }) satisfies CMSPageService;
