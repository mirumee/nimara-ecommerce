import { invariant } from "ts-invariant";

import type { CMSMenuService } from "@nimara/infrastructure/use-cases/cms-menu/types";
import type { CMSPageService } from "@nimara/infrastructure/use-cases/cms-page/types";

import { clientEnvs } from "@/envs/client";
import { storefrontLogger } from "@/services/logging";

const isSaleorCMS = clientEnvs.NEXT_PUBLIC_CMS_SERVICE === "SALEOR";

/**
 * Lazy loads the CMS service responsible for fetching CMS pages.
 * @returns A promise that resolves to the CMSPageService instance.
 * This service is used to fetch CMS pages from either Saleor or ButterCMS based on the
 */
const getCMSPageService = async (): Promise<CMSPageService> => {
  if (isSaleorCMS) {
    const { saleorCMSPageService } = await import(
      "@nimara/infrastructure/cms-page/providers"
    );

    return saleorCMSPageService({
      logger: storefrontLogger,
      apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    });
  } else {
    invariant(
      clientEnvs.NEXT_PUBLIC_BUTTER_CMS_API_KEY,
      "ButterCMS API key is required but not provided. Please set NEXT_PUBLIC_BUTTER_CMS_API_KEY in the environment variables.",
    );

    const { butterCMSPageService } = await import(
      "@nimara/infrastructure/cms-page/providers"
    );

    return butterCMSPageService({
      logger: storefrontLogger,
      token: clientEnvs.NEXT_PUBLIC_BUTTER_CMS_API_KEY,
    });
  }
};

/**
 * Lazy loads the CMS service responsible for fetching CMS menus.
 * @returns A promise that resolves to the CMSMenuService instance.
 * This service is used to fetch CMS menus from either Saleor or ButterCMS based on the
 */
const getCMSMenuService = async (): Promise<CMSMenuService> => {
  if (isSaleorCMS) {
    const { saleorCMSMenuService } = await import(
      "@nimara/infrastructure/cms-menu/providers"
    );

    return saleorCMSMenuService({
      logger: storefrontLogger,
      apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    });
  } else {
    invariant(
      clientEnvs.NEXT_PUBLIC_BUTTER_CMS_API_KEY,
      "ButterCMS API key is required but not provided. Please set NEXT_PUBLIC_BUTTER_CMS_API_KEY in the environment variables.",
    );

    const { butterCMSMenuService } = await import(
      "@nimara/infrastructure/cms-menu/providers"
    );

    return butterCMSMenuService({
      logger: storefrontLogger,
      token: clientEnvs.NEXT_PUBLIC_BUTTER_CMS_API_KEY,
    });
  }
};

export const cmsPageService: CMSPageService = await getCMSPageService();
export const cmsMenuService: CMSMenuService = await getCMSMenuService();
