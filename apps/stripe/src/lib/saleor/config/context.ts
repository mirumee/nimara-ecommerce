import { CONFIG } from "@/config";
import { responseError } from "@/lib/api/util";
import { isError } from "@/lib/error";
import { getConfigProvider } from "@/providers/config";
import { getJWKSProvider } from "@/providers/jwks";

import { verifyJWTSignature } from "../auth/jwt";
import { SaleorDomainNotAllowedError } from "../error";
import { type PaymentGatewayConfig } from "./schema";
import { getSaleorDomainFromApiUrl, isDomainAllowed } from "./util";

type AppConfigForChannel = {
  authToken: string;
  gatewayConfig: PaymentGatewayConfig[string];
};

export const assertDomainAllowed = (saleorDomain: string) => {
  if (
    !isDomainAllowed({
      domain: saleorDomain,
      allowedDomains: CONFIG.ALLOWED_DOMAINS,
    })
  ) {
    throw new SaleorDomainNotAllowedError(
      CONFIG.ALLOWED_DOMAINS.length
        ? `${saleorDomain} is not an allowed Saleor domain.`
        : "No Saleor domain is allowed. Set ALLOWED_DOMAINS to the domains this deployment serves.",
    );
  }
};

export const resolveDashboardTenant = async ({
  accessToken,
  saleorApiUrl,
}: {
  accessToken: string;
  saleorApiUrl: string;
}) => {
  const saleorDomain = getSaleorDomainFromApiUrl(saleorApiUrl);

  assertDomainAllowed(saleorDomain);

  await verifyJWTSignature({
    jwksProvider: getJWKSProvider({ saleorDomain }),
    jwt: accessToken,
    saleorDomain,
  });

  return { saleorDomain };
};

export const getAppConfigForChannel = async ({
  channelSlug,
  saleorDomain,
}: {
  channelSlug: string;
  saleorDomain: string;
}): Promise<AppConfigForChannel> => {
  const config = await getConfigProvider().getBySaleorDomain({
    saleorDomain,
  });

  if (!config) {
    throw new Error(`Missing config for ${saleorDomain}.`);
  }

  const gatewayConfig = config.paymentGatewayConfig[channelSlug];

  if (!gatewayConfig) {
    throw new Error(`Missing config for ${saleorDomain} - ${channelSlug}.`);
  }

  return { authToken: config.authToken, gatewayConfig };
};

/**
 * Route-level wrapper: yields the channel configuration, or the response to
 * answer Saleor with when the channel is not configured for this app.
 */
export const resolveAppConfigForChannel = async (opts: {
  channelSlug: string;
  saleorDomain: string;
}): Promise<
  | { config: AppConfigForChannel; response?: never }
  | { config?: never; response: Response }
> => {
  try {
    return { config: await getAppConfigForChannel(opts) };
  } catch (err) {
    return {
      response: responseError({
        description: "Missing gateway configuration for channel.",
        errors: isError(err) ? [{ message: err.message }] : [],
        status: 422,
      }),
    };
  }
};
