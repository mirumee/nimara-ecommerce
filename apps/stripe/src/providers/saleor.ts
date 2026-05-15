import { CONFIG } from "@/config";
import { saleorClient, type SaleorClientOpts } from "@/lib/saleor/client";

const normalizeSaleorDomain = (value: string) => {
  const trimmedValue = value.trim();

  try {
    return new URL(trimmedValue).host.toLowerCase();
  } catch {
    return trimmedValue.toLowerCase();
  }
};

export const getSaleorClient = ({
  saleorDomain,
  ...opts
}: Omit<SaleorClientOpts, "saleorUrl" | "timeout"> & {
  saleorDomain: string;
}) => {
  if (normalizeSaleorDomain(saleorDomain) !== CONFIG.SALEOR_DOMAIN) {
    throw new Error("Saleor domain/url mismatch!");
  }

  return saleorClient({
    saleorUrl: CONFIG.SALEOR_URL,
    timeout: CONFIG.FETCH_TIMEOUT,
    ...opts,
  });
};
