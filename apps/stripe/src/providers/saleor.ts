import { CONFIG } from "@/config";
import { saleorClient, type SaleorClientOpts } from "@/lib/saleor/client";
import { getSaleorUrlFromDomain } from "@/lib/saleor/config/util";

export const getSaleorClient = ({
  saleorDomain,
  ...opts
}: Omit<SaleorClientOpts, "saleorUrl" | "timeout"> & {
  saleorDomain: string;
}) =>
  saleorClient({
    saleorUrl: getSaleorUrlFromDomain(saleorDomain),
    timeout: CONFIG.FETCH_TIMEOUT,
    ...opts,
  });
