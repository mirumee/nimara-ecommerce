import { type PaymentGatewayConfig, type SaleorAppConfig } from "./schema";

export type SaleorAppConfigProviderFactoryMethods<Config = SaleorAppConfig> = {
  createOrUpdate: (opts: Config) => Promise<Config>;
  getBySaleorAppId: (opts: { saleorAppId: string }) => Promise<Config | null>;
  getBySaleorDomain: (opts: { saleorDomain: string }) => Promise<Config | null>;
  getPaymentGatewayConfigForChannel: (opts: {
    channelSlug: string;
    saleorDomain: string;
  }) => Promise<PaymentGatewayConfig["string"]>;
  updatePaymentGatewayConfig: (opts: {
    data: PaymentGatewayConfig;
    saleorDomain: string;
  }) => Promise<PaymentGatewayConfig>;
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
