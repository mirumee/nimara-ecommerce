import { butterCMSMenuService } from "@nimara/infrastructure/public/butter-cms/cms-menu/providers";
import { butterCMSPageService } from "@nimara/infrastructure/public/butter-cms/cms-page/providers";
import { saleorCMSMenuService } from "@nimara/infrastructure/public/saleor/cms-menu/providers";
import { saleorCMSPageService } from "@nimara/infrastructure/public/saleor/cms-page/providers";
import type { CMSMenuService } from "@nimara/infrastructure/use-cases/cms-menu/types";
import type { CMSPageService } from "@nimara/infrastructure/use-cases/cms-page/types";

import { clientEnvs } from "@/envs/client";

export const cmsPageServiceSaleor = saleorCMSPageService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
});

export const cmsPageServiceButterCMS = butterCMSPageService({
  token: clientEnvs.NEXT_PUBLIC_BUTTER_CMS_API_KEY,
});

export const cmsMenuServiceSaleor = saleorCMSMenuService({
  apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
});

export const cmsMenuServiceButterCMS = butterCMSMenuService({
  token: clientEnvs.NEXT_PUBLIC_BUTTER_CMS_API_KEY,
});

export const cmsPageService: CMSPageService = cmsPageServiceButterCMS;

export const cmsMenuService: CMSMenuService = cmsMenuServiceButterCMS;
