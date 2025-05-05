import { type Logger } from "#root/logging/types";

export type SaleorCMSMenuServiceConfig = {
  apiURL: string;
  logger: Logger;
};

export type ButterCMSMenuServiceConfig = {
  logger: Logger;
  token: string;
};
