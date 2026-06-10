import { cmsPageGetUseCase } from "#root/use-cases/cms-page/cms-page-get-use-case";
import { type CMSPageService } from "#root/use-cases/cms-page/types";

import { butterCMSPageGetInfra } from "./butter-cms/infrastructure/cms-page-get-infra";
import { dummyCMSPageGetInfra } from "./dummy/infrastructure/cms-page-get-infra";
import { type DummyCMSPageServiceConfig } from "./dummy/types";
import { saleorCMSPageGetInfra } from "./saleor/infrastructure/cms-page-get-infra";
import type {
  ButterCMSPageServiceConfig,
  SaleorCMSPageServiceConfig,
} from "./types";

export const saleorCMSPageService = (config: SaleorCMSPageServiceConfig) =>
  ({
    cmsPageGet: cmsPageGetUseCase({
      cmsPageGetInfra: saleorCMSPageGetInfra(config),
    }),
  }) satisfies CMSPageService;

export const butterCMSPageService = (config: ButterCMSPageServiceConfig) =>
  ({
    cmsPageGet: cmsPageGetUseCase({
      cmsPageGetInfra: butterCMSPageGetInfra(config),
    }),
  }) satisfies CMSPageService;

export const dummyCMSPageService = (config: DummyCMSPageServiceConfig) =>
  ({
    cmsPageGet: cmsPageGetUseCase({
      cmsPageGetInfra: dummyCMSPageGetInfra(config),
    }),
  }) satisfies CMSPageService;
