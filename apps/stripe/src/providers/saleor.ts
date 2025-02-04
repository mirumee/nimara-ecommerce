import { CONFIG } from "@/config";
import { saleorClient } from "@/lib/saleor/graphql/client";
import { type SaleorClientFactoryOpts } from "@/lib/saleor/graphql/types";

export const getSaleorClient = ({
  saleorDomain,
  ...opts
}: Omit<SaleorClientFactoryOpts, "saleorUrl" | "timeout" | "logger"> & {
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
