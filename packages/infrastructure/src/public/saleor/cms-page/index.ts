import { cmsPageGetUseCase } from "#root/use-cases/cms-page/cms-page-get-use-case";

import { saleorCMSPageGetInfra } from "./infrastructure/cms-page-get-infra";
import type { CMSPageService, SaleorCMSPageServiceConfig } from "./types";

export const saleorCMSPageService: CMSPageService<
  SaleorCMSPageServiceConfig
> = (config) => ({
  cmsPageGet: cmsPageGetUseCase({
    cmsPageGetInfra: saleorCMSPageGetInfra(config),
  }),
});
