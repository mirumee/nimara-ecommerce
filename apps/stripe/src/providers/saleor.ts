import { CONFIG } from "@/config";
import { saleorClient, type SaleorClientOpts } from "@/lib/saleor/client";

export const getSaleorClient = ({
  saleorDomain,
  ...opts
}: Omit<SaleorClientOpts, "saleorUrl" | "timeout"> & {
  saleorDomain: string;
}) => {
  if (saleorDomain !== CONFIG.SALEOR_DOMAIN) {
    throw new Error("Saleor domain/url mismatch!");
  }

  return saleorClient({
    saleorUrl: CONFIG.SALEOR_URL,
    timeout: CONFIG.FETCH_TIMEOUT,
    ...opts,
  });
};
