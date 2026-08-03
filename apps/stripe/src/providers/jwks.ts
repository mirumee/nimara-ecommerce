import { JWKSMemoryProvider } from "@/lib/jwks/memory";
import { getSaleorUrlFromDomain } from "@/lib/saleor/config/util";

export const getJWKSProvider = ({ saleorDomain }: { saleorDomain: string }) =>
  JWKSMemoryProvider({ remoteUrl: getSaleorUrlFromDomain(saleorDomain) });
