import { type Logger } from "#root/logging/types";

export type SaleorCMSPageServiceConfig = {
  apiURL: string;
  logger: Logger;
};

export type ButterCMSPageServiceConfig = {
  logger: Logger;
  token: string;
};
