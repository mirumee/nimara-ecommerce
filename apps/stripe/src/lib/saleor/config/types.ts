import { type PaymentGatewayConfig, type SaleorAppConfig } from "./schema";

export type SaleorAppConfigProviderFactoryMethods<Config = SaleorAppConfig> = {
  createOrUpdate: (opts: Config) => Promise<Config>;
  getBySaleorAppId: (opts: { saleorAppId: string }) => Promise<Config | null>;
  getBySaleorDomain: (opts: { saleorDomain: string }) => Promise<Config | null>;
  updatePaymentGatewayConfigBySaleorDomain: (opts: {
    data: PaymentGatewayConfig;
    saleorDomain: string;
  }) => Promise<Config | null>;
};

export type SaleorAppConfigProviderFactory<
  Opts = unknown,
  Config = SaleorAppConfig,
> = Opts extends unknown
  ? (
      opts: Opts extends never ? undefined : Opts,
    ) => SaleorAppConfigProviderFactoryMethods<Config>
  : (opts?: Opts) => SaleorAppConfigProviderFactoryMethods<Config>;

export type SaleorAppConfigProvider = SaleorAppConfigProviderFactoryMethods;
