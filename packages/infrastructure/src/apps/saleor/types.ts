import {
  type BaseError,
  type SaleorAppErrorCode,
} from "@nimara/domain/objects/Error";
import { type AsyncResult } from "@nimara/domain/objects/Result";
import { type SaleorAppConfig } from "@nimara/domain/objects/SaleorApp";

import { type Logger } from "#root/logging/types";

export type SaleorAppError = BaseError<SaleorAppErrorCode>;

// Saleor names the permission claim differently for a staff and an app token.
export type SaleorJwtClaims = {
  permissions?: string[];
  user_permissions?: string[];
};

export type SaleorAppConfigRepository = {
  createOrUpdate: (opts: {
    config: SaleorAppConfig;
  }) => AsyncResult<SaleorAppConfig>;
  getBySaleorDomain: (opts: {
    saleorDomain: string;
  }) => AsyncResult<SaleorAppConfig | null>;
};

export type SaleorAppClient = {
  getAppId: () => AsyncResult<string | null>;
};

export type SaleorAppClientFactory = (opts: {
  authToken: string;
  logger?: Logger;
  saleorUrl: string;
}) => SaleorAppClient;

export type InstallSaleorAppUseCase = (opts: {
  authToken: string;
  saleorDomain: string;
  saleorUrl: string;
}) => AsyncResult<SaleorAppConfig>;
