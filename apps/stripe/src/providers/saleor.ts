import { CONFIG } from "@/config";
import { saleorClient } from "@/lib/saleor/graphql/client";
import { type SaleorClientFactoryOpts } from "@/lib/saleor/graphql/types";

export const getSaleorClient = (
  opts: Omit<SaleorClientFactoryOpts, "saleorUrl" | "timeout" | "logger">,
) =>
  saleorClient({
    saleorUrl: CONFIG.SALEOR_URL,
    timeout: CONFIG.FETCH_TIMEOUT,
    ...opts,
  });
