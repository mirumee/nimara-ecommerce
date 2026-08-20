import { err, ok } from "@nimara/domain/objects/Result";

import {
  type InstallSaleorAppUseCase,
  type SaleorAppClientFactory,
  type SaleorAppConfigRepository,
} from "#root/apps/saleor/types";

export const installSaleorAppUseCase =
  ({
    configRepository,
    saleorAppClientFactory,
  }: {
    configRepository: SaleorAppConfigRepository;
    saleorAppClientFactory: SaleorAppClientFactory;
  }): InstallSaleorAppUseCase =>
  async ({ authToken, saleorDomain, saleorUrl }) => {
    const saleorAppClient = saleorAppClientFactory({ authToken, saleorUrl });
    const appIdResult = await saleorAppClient.getAppId();

    if (!appIdResult.ok) {
      return appIdResult;
    }

    if (!appIdResult.data) {
      return err([
        {
          code: "SALEOR_APP_INSTALL_ERROR",
          message: "Could not fetch the app id from Saleor.",
        },
      ]);
    }

    const savedResult = await configRepository.createOrUpdate({
      config: {
        authToken,
        saleorAppId: appIdResult.data,
        saleorDomain,
      },
    });

    if (!savedResult.ok) {
      return savedResult;
    }

    return ok(savedResult.data);
  };
