import { z } from "zod";

export const paymentGatewayConfig = z.record(
  z.string(),
  z.object({
    accountId: z.string().optional(),
    currency: z.string(),
    publicKey: z.string(),
    secretKey: z.string(),
    webhookSecretKey: z.string().optional(),
    webhookId: z.string().optional(),
  }),
);

export type PaymentGatewayConfig = z.infer<typeof paymentGatewayConfig>;

export const saleorAppConfig = z.object({
  authToken: z.string(),
  saleorAppId: z.string(),
  saleorDomain: z.string(),
  paymentGatewayConfig: paymentGatewayConfig,
});

export type SaleorAppConfig = z.infer<typeof saleorAppConfig>;

export const saleorMultiTenantAppConfig = z.record(z.string(), saleorAppConfig);

export type SaleorMultiTenantAppConfig = z.infer<
  typeof saleorMultiTenantAppConfig
>;

export const parseStoredConfig = (
  data: unknown,
): SaleorMultiTenantAppConfig => {
  const singleTenant = saleorAppConfig.safeParse(data);

  if (singleTenant.success) {
    return { [singleTenant.data.saleorDomain]: singleTenant.data };
  }

  return saleorMultiTenantAppConfig.parse(data);
};
