import { clientEnvs } from "@/envs/client";

const getRequiredEnv = (
  value: string | undefined,
  envName: string,
  serviceName: string,
) => {
  if (!value) {
    throw new Error(`Please set ${envName} to use ${serviceName}.`);
  }

  return value;
};

export const getRequiredSaleorApiUrl = (serviceName: string) =>
  getRequiredEnv(
    clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    "NEXT_PUBLIC_SALEOR_API_URL",
    serviceName,
  );
